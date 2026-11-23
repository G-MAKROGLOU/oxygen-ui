// Pure text-search helpers for PdfViewer. No DOM access. The functions map
// matches in normalized text back to raw offsets and pdf.js text-item
// positions, so the component can paint highlight spans in the text layer.

/** One pdf.js text item: its string and whether a line ends after it. */
export interface PageIndexItem {
    str: string
    hasEOL?: boolean
}

/** Concatenated page text plus the offset of each item inside it. */
export interface PageIndex {
    /** Raw item strings, in pdf.js order. */
    items: string[]
    /**
     * Concatenation of the item strings. No fabricated separator is inserted;
     * a real line end (`hasEOL`) contributes one `\n` after its item.
     */
    text: string
    /** `starts[i]` is the offset of `items[i]` inside `text`. */
    starts: number[]
}

/** Normalized text plus a map from normalized offsets back to raw offsets. */
export interface NormalizedText {
    text: string
    /**
     * `map[i]` is the raw offset of the character that produced normalized
     * character `i`. `map[text.length]` is the raw length.
     */
    map: number[]
}

/** A position inside the item list. */
export interface ItemPos {
    itemIndex: number
    charOffset: number
}

/** One match: raw offsets into `PageIndex.text` plus item positions. */
export interface Occurrence {
    /** Raw start offset, inclusive. */
    start: number
    /** Raw end offset, exclusive. */
    end: number
    beginItem: ItemPos
    endItem: ItemPos
}

/** The slice of pdf.js's `getTextContent()` result that the index needs. */
export interface TextContentLike {
    items: ReadonlyArray<{ str?: string; hasEOL?: boolean }>
}

/**
 * Build a page index straight from pdf.js's `getTextContent()` result. Both
 * PdfViewer's `highlight` prop and the headless `searchPdfPhrase` use this
 * one function, so their extraction cannot drift.
 */
export function indexFromTextContent(tc: TextContentLike): PageIndex {
    return buildPageIndex(tc.items.map((it) => ({ str: it.str ?? '', hasEOL: it.hasEOL === true })))
}

/** Build the searchable index of one page from its pdf.js text items. */
export function buildPageIndex(items: ReadonlyArray<string | PageIndexItem>): PageIndex {
    const strs: string[] = []
    const starts: number[] = []
    let text = ''
    for (const it of items) {
        const str = typeof it === 'string' ? it : it.str
        const hasEOL = typeof it === 'string' ? false : it.hasEOL === true
        starts.push(text.length)
        strs.push(str)
        text += str
        if (hasEOL) text += '\n'
    }
    return { items: strs, text, starts }
}

// Quote and hyphen folding, the same set pdf.js's find controller uses for
// punctuation that PDF extractors commonly emit in typographic form.
const CHAR_MAP: Record<string, string> = {
    '‐': '-',
    '‘': "'",
    '’': "'",
    '‚': "'",
    '‛': "'",
    '“': '"',
    '”': '"',
    '„': '"',
    '‟': '"',
}

const LETTER = /\p{L}/u
const LOWER = /\p{Ll}/u
const WS = /\s/

/**
 * Normalize text for matching: Unicode NFKC (folds ligatures such as "ﬁ"),
 * soft hyphens removed, a word hyphenated at a line end re-joined, curly
 * quotes and U+2010 mapped to ASCII, whitespace runs collapsed to one space,
 * lower case. The returned map converts normalized offsets back to raw ones.
 */
export function normalizeForSearch(raw: string): NormalizedText {
    const out: string[] = []
    const map: number[] = []
    const emit = (s: string, rawIdx: number) => {
        for (let k = 0; k < s.length; k++) {
            out.push(s[k])
            map.push(rawIdx)
        }
    }
    let i = 0
    while (i < raw.length) {
        const cp = raw.codePointAt(i) as number
        const ch = String.fromCodePoint(cp)
        const size = ch.length
        // Soft hyphen: invisible, drop it.
        if (cp === 0xad) { i += size; continue }
        // Line-end hyphenation: letter-"-"-"\n"-letter joins back to one word.
        // Same shape as pdf.js: after a lower-case letter the next letter must
        // be lower case too, after an upper-case letter any letter joins.
        if ((ch === '-' || ch === '‐') && raw[i + 1] === '\n') {
            const prev = out.length > 0 ? out[out.length - 1] : ''
            const nextCp = i + 2 < raw.length ? (raw.codePointAt(i + 2) as number) : null
            const next = nextCp == null ? '' : String.fromCodePoint(nextCp)
            const join =
                prev !== '' && LETTER.test(prev) && next !== '' && LETTER.test(next) &&
                (!LOWER.test(prev) || LOWER.test(next))
            if (join) { i += 2; continue }
        }
        // Whitespace run (line breaks included) collapses to one space.
        if (WS.test(ch)) {
            if (out.length > 0 && out[out.length - 1] !== ' ') emit(' ', i)
            i += size
            continue
        }
        const mapped = CHAR_MAP[ch]
        if (mapped !== undefined) { emit(mapped, i); i += size; continue }
        emit(ch.normalize('NFKC').toLowerCase(), i)
        i += size
    }
    while (out.length > 0 && out[out.length - 1] === ' ') { out.pop(); map.pop() }
    map.push(raw.length)
    return { text: out.join(''), map }
}

/** Length in UTF-16 units of the raw character starting at `off`. */
function rawCharLen(text: string, off: number): number {
    const code = text.charCodeAt(off)
    return code >= 0xd800 && code <= 0xdbff && off + 1 < text.length ? 2 : 1
}

/** Map a raw offset to an item position. `endExclusive` maps an end offset. */
function rawToItem(index: PageIndex, off: number, endExclusive: boolean): ItemPos {
    const { starts, items } = index
    if (items.length === 0) return { itemIndex: 0, charOffset: 0 }
    let lo = 0
    let hi = starts.length - 1
    let ans = 0
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        const boundary = endExclusive ? starts[mid] < off : starts[mid] <= off
        if (boundary) { ans = mid; lo = mid + 1 } else hi = mid - 1
    }
    const charOffset = Math.max(0, Math.min(off - starts[ans], items[ans].length))
    return { itemIndex: ans, charOffset }
}

function toOccurrence(index: PageIndex, norm: NormalizedText, nStart: number, nEnd: number): Occurrence {
    const start = norm.map[nStart]
    const lastRaw = norm.map[nEnd - 1]
    const end = Math.min(index.text.length, lastRaw + rawCharLen(index.text, lastRaw))
    return {
        start,
        end,
        beginItem: rawToItem(index, start, false),
        endItem: rawToItem(index, end, true),
    }
}

/**
 * All non-overlapping matches of `query` in the page, in document order.
 * Pass a cached `norm` (from `normalizeForSearch(index.text)`) to avoid
 * re-normalizing the page per query.
 */
export function findOccurrences(index: PageIndex, query: string, norm?: NormalizedText): Occurrence[] {
    const needle = normalizeForSearch(query).text
    if (needle.length === 0) return []
    const np = norm ?? normalizeForSearch(index.text)
    const result: Occurrence[] = []
    let from = 0
    for (;;) {
        const j = np.text.indexOf(needle, from)
        if (j === -1) break
        result.push(toOccurrence(index, np, j, j + needle.length))
        from = j + needle.length
    }
    return result
}

/**
 * Anchor match for a phrase from a different extractor. The anchor is the
 * first 8 words of the normalized phrase; the highlight runs from the anchor
 * start for the normalized phrase length, clamped to the page end. Returns
 * the `occurrence`-th anchor match (default the first), or null.
 */
export function findPhrase(
    index: PageIndex,
    phrase: string,
    opts: { occurrence?: number; norm?: NormalizedText } = {},
): Occurrence | null {
    const nPhrase = normalizeForSearch(phrase).text
    if (nPhrase.length === 0) return null
    const anchor = nPhrase.split(' ').slice(0, 8).join(' ')
    const np = opts.norm ?? normalizeForSearch(index.text)
    const wanted = opts.occurrence ?? 0
    let from = 0
    for (let k = 0; ; k++) {
        const j = np.text.indexOf(anchor, from)
        if (j === -1) return null
        if (k === wanted) {
            const nEnd = Math.min(np.text.length, j + nPhrase.length)
            return toOccurrence(index, np, j, nEnd)
        }
        from = j + anchor.length
    }
}
