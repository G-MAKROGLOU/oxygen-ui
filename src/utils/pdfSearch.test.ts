import { describe, it, expect } from 'vitest'
import { buildPageIndex, normalizeForSearch, findOccurrences, findPhrase } from './pdfSearch'

describe('buildPageIndex', () => {
    it('concatenates items without a fabricated separator', () => {
        const idx = buildPageIndex(['foo', 'bar'])
        expect(idx.text).toBe('foobar')
        expect(idx.starts).toEqual([0, 3])
    })

    it('adds a newline for a real line end only', () => {
        const idx = buildPageIndex([{ str: 'hello', hasEOL: true }, { str: 'world' }])
        expect(idx.text).toBe('hello\nworld')
        expect(idx.starts).toEqual([0, 6])
    })
})

describe('normalizeForSearch', () => {
    it('lower-cases and folds curly quotes', () => {
        expect(normalizeForSearch('It’s FINE').text).toBe("it's fine")
    })

    it('collapses whitespace runs and trims', () => {
        expect(normalizeForSearch('  foo \t\n bar  ').text).toBe('foo bar')
    })

    it('removes soft hyphens', () => {
        expect(normalizeForSearch('exam­ple').text).toBe('example')
    })

    it('joins a word hyphenated at a line end', () => {
        expect(normalizeForSearch('exam-\nple next').text).toBe('example next')
    })

    it('keeps a hyphen that is not at a line end', () => {
        expect(normalizeForSearch('well-known').text).toBe('well-known')
    })

    it('folds the fi ligature via NFKC', () => {
        expect(normalizeForSearch('ﬁle').text).toBe('file')
    })

    it('maps normalized offsets back to raw offsets', () => {
        const n = normalizeForSearch('A’s  ﬁx')
        // normalized: a ' s space f i x
        expect(n.text).toBe("a's fix")
        expect(n.map[0]).toBe(0)  // a <- A
        expect(n.map[1]).toBe(1)  // ' <- curly quote
        expect(n.map[4]).toBe(5)  // f <- ligature
        expect(n.map[5]).toBe(5)  // i <- same ligature char
        expect(n.map[6]).toBe(6)  // x
        expect(n.map[n.text.length]).toBe(7) // raw length sentinel
    })
})

describe('findOccurrences', () => {
    it('finds a match inside one item', () => {
        const idx = buildPageIndex(['hello world'])
        const occ = findOccurrences(idx, 'world')
        expect(occ).toHaveLength(1)
        expect(occ[0]).toMatchObject({
            start: 6, end: 11,
            beginItem: { itemIndex: 0, charOffset: 6 },
            endItem: { itemIndex: 0, charOffset: 11 },
        })
    })

    it('finds a match across two items', () => {
        const idx = buildPageIndex(['foo ba', 'r baz'])
        const occ = findOccurrences(idx, 'bar')
        expect(occ).toHaveLength(1)
        expect(occ[0]).toMatchObject({
            start: 4, end: 7,
            beginItem: { itemIndex: 0, charOffset: 4 },
            endItem: { itemIndex: 1, charOffset: 1 },
        })
    })

    it('finds a match across a line break', () => {
        const idx = buildPageIndex([{ str: 'hello', hasEOL: true }, { str: 'world' }])
        const occ = findOccurrences(idx, 'hello world')
        expect(occ).toHaveLength(1)
        expect(occ[0]).toMatchObject({
            start: 0, end: 11,
            beginItem: { itemIndex: 0, charOffset: 0 },
            endItem: { itemIndex: 1, charOffset: 5 },
        })
    })

    it('finds a word hyphenated at a line end by the unhyphenated query', () => {
        const idx = buildPageIndex([{ str: 'exam-', hasEOL: true }, { str: 'ple follows' }])
        const occ = findOccurrences(idx, 'example')
        expect(occ).toHaveLength(1)
        expect(occ[0]).toMatchObject({
            start: 0, end: 9,
            beginItem: { itemIndex: 0, charOffset: 0 },
            endItem: { itemIndex: 1, charOffset: 3 },
        })
    })

    it('finds a word with a soft hyphen inside it', () => {
        const idx = buildPageIndex(['exam­ple'])
        const occ = findOccurrences(idx, 'example')
        expect(occ).toHaveLength(1)
        expect(occ[0]).toMatchObject({ start: 0, end: 8 })
    })

    it('finds a ligature by its ASCII form', () => {
        const idx = buildPageIndex(['the ﬁle name'])
        const occ = findOccurrences(idx, 'file')
        expect(occ).toHaveLength(1)
        // The ligature is one raw character; the match covers it fully.
        expect(occ[0]).toMatchObject({
            start: 4, end: 7,
            beginItem: { itemIndex: 0, charOffset: 4 },
            endItem: { itemIndex: 0, charOffset: 7 },
        })
    })

    it('matches across whitespace runs', () => {
        const idx = buildPageIndex(['foo   bar'])
        const occ = findOccurrences(idx, 'foo bar')
        expect(occ).toHaveLength(1)
        expect(occ[0]).toMatchObject({ start: 0, end: 9 })
    })

    it('folds case and curly quotes on both sides', () => {
        const idx = buildPageIndex(['It’s Fine'])
        expect(findOccurrences(idx, "IT'S FINE")).toHaveLength(1)
    })

    it('returns no match when the text does not contain the query', () => {
        const idx = buildPageIndex(['abc def'])
        expect(findOccurrences(idx, 'xyz')).toEqual([])
    })

    it('returns every occurrence on the page, non-overlapping', () => {
        const idx = buildPageIndex(['ab ab ab'])
        const occ = findOccurrences(idx, 'ab')
        expect(occ.map((o) => o.start)).toEqual([0, 3, 6])
    })

    it('returns nothing for an empty or whitespace query', () => {
        const idx = buildPageIndex(['abc'])
        expect(findOccurrences(idx, '')).toEqual([])
        expect(findOccurrences(idx, '   ')).toEqual([])
    })

    it('reuses a cached normalization when given', () => {
        const idx = buildPageIndex(['hello world'])
        const norm = normalizeForSearch(idx.text)
        expect(findOccurrences(idx, 'WORLD', norm)).toHaveLength(1)
    })
})

describe('findPhrase', () => {
    it('matches by the first 8 words even when the tail differs', () => {
        const idx = buildPageIndex(['one two three four five six seven eight nine ten'])
        const r = findPhrase(idx, 'one two three four five six seven eight DIFFERENT TAIL')
        expect(r).not.toBeNull()
        expect(r?.start).toBe(0)
        // Highlight length is the normalized phrase length, clamped to the page end.
        expect(r?.end).toBe(idx.text.length)
    })

    it('selects the requested occurrence', () => {
        const idx = buildPageIndex(['alpha beta alpha beta'])
        const r0 = findPhrase(idx, 'alpha beta')
        const r1 = findPhrase(idx, 'alpha beta', { occurrence: 1 })
        expect(r0?.start).toBe(0)
        expect(r1?.start).toBe(11)
    })

    it('returns null when the anchor is absent', () => {
        const idx = buildPageIndex(['nothing relevant here'])
        expect(findPhrase(idx, 'completely different phrase')).toBeNull()
        expect(findPhrase(idx, '')).toBeNull()
    })

    it('normalizes extractor whitespace and hyphenation differences', () => {
        const idx = buildPageIndex([{ str: 'The pro-', hasEOL: true }, { str: 'posed system  works' }])
        const r = findPhrase(idx, 'the proposed system works')
        expect(r).not.toBeNull()
        expect(r?.beginItem).toEqual({ itemIndex: 0, charOffset: 0 })
        expect(r?.endItem.itemIndex).toBe(1)
    })
})
