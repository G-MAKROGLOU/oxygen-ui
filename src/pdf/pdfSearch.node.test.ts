// @vitest-environment node
// Headless search against the real committed fixture PDF, in Node, no DOM.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { searchPdfPhrase, indexFromTextContent, findPhrase, type PdfDocumentLike } from './index'

const bytes = () => new Uint8Array(readFileSync(resolve(__dirname, '../components/core/__fixtures__/pdf-highlight-sample.pdf')))

describe('searchPdfPhrase (Node, real PDF bytes)', () => {
    it('finds a phrase with a hyphenated line break (page 1)', async () => {
        const r = await searchPdfPhrase(bytes(), 1, 'the PdfViewer search transformation cases')
        expect(r.found).toBe(true)
        expect(r.page).toBe(1)
        expect(r.matchedText).toContain('transfor-')
        expect(typeof r.start).toBe('number')
        expect(r.end as number).toBeGreaterThan(r.start as number)
    })

    it('finds a phrase through a ligature (page 2)', async () => {
        const r = await searchPdfPhrase(bytes(), 2, 'the specific configuration uses a real fi ligature glyph')
        expect(r.found).toBe(true)
        expect(r.matchedText).toContain('specific configuration')
    })

    it('finds a phrase inside one column of a two-column section (page 2)', async () => {
        const r = await searchPdfPhrase(bytes(), 2, 'left column line two')
        expect(r.found).toBe(true)
    })

    it('finds a table cell (page 3)', async () => {
        expect((await searchPdfPhrase(bytes(), 3, 'MV Aurora')).found).toBe(true)
        expect((await searchPdfPhrase(bytes(), 3, '9876543')).found).toBe(true)
    })

    it('does not find a phrase that crosses a page break, on either page', async () => {
        const phrase = 'the final clause of this agreement continues on the following page'
        expect((await searchPdfPhrase(bytes(), 3, phrase)).found).toBe(false)
        expect((await searchPdfPhrase(bytes(), 4, phrase)).found).toBe(false)
        // pageTolerance does not help: the phrase exists on no single page.
        expect((await searchPdfPhrase(bytes(), 3, phrase, { pageTolerance: 1 })).found).toBe(false)
    })

    it('finds the page-local halves of the cross-page phrase', async () => {
        expect((await searchPdfPhrase(bytes(), 3, 'the final clause of this agreement continues')).found).toBe(true)
        expect((await searchPdfPhrase(bytes(), 4, 'on the following page of the document')).found).toBe(true)
    })

    it('reports a miss with the requested page and no offsets', async () => {
        const r = await searchPdfPhrase(bytes(), 2, 'this phrase does not exist anywhere')
        expect(r).toEqual({ found: false, page: 2 })
    })

    it('pageTolerance finds the phrase on a neighbouring page and reports that page', async () => {
        const phrase = 'page four ends the fixture'
        expect((await searchPdfPhrase(bytes(), 3, phrase)).found).toBe(false)
        const r = await searchPdfPhrase(bytes(), 3, phrase, { pageTolerance: 1 })
        expect(r.found).toBe(true)
        expect(r.page).toBe(4)
    })

    it('leaves the caller bytes usable across repeated calls (no buffer transfer)', async () => {
        const sameBytes = bytes()
        expect((await searchPdfPhrase(sameBytes, 3, 'MV Aurora')).found).toBe(true)
        // pdf.js detaches the buffer it receives; the search must copy, so a
        // second call with the same Uint8Array works.
        expect((await searchPdfPhrase(sameBytes, 4, 'page four ends the fixture')).found).toBe(true)
        expect(sameBytes.byteLength).toBeGreaterThan(0)
    })

    it('clamps tolerance candidates to the document bounds', async () => {
        const r = await searchPdfPhrase(bytes(), 1, 'ligatures and columns', { pageTolerance: 5 })
        expect(r.found).toBe(true)
        expect(r.page).toBe(2)
    })
})

describe('searchPdfPhrase (Node, PDFDocumentProxy input)', () => {
    let task: { promise: Promise<PdfDocumentLike>; destroy(): Promise<void> }
    let doc: PdfDocumentLike

    beforeAll(async () => {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
        task = pdfjs.getDocument({ data: bytes() }) as typeof task
        doc = await task.promise
    })
    afterAll(async () => { await task.destroy() })

    it('accepts an existing document and leaves it usable', async () => {
        const r = await searchPdfPhrase(doc, 1, 'the quick brown fox jumps over the lazy dog')
        expect(r.found).toBe(true)
        // The caller's document is not destroyed by the search.
        const page = await doc.getPage(1)
        expect((await page.getTextContent()).items.length).toBeGreaterThan(0)
    })

    it('equals the shared PdfViewer matcher path for every fixture page', async () => {
        const cases: Array<{ page: number; phrase: string }> = [
            { page: 1, phrase: 'the PdfViewer search transformation cases' },
            { page: 2, phrase: 'the specific configuration uses a real fi ligature glyph' },
            { page: 3, phrase: 'MV Aurora' },
            { page: 3, phrase: 'the final clause of this agreement continues on the following page' },
            { page: 4, phrase: 'page four ends the fixture' },
        ]
        for (const c of cases) {
            const tc = await (await doc.getPage(c.page)).getTextContent()
            const occ = findPhrase(indexFromTextContent(tc), c.phrase)
            const r = await searchPdfPhrase(doc, c.page, c.phrase)
            expect(r.found).toBe(occ != null)
            if (occ) {
                expect(r.start).toBe(occ.start)
                expect(r.end).toBe(occ.end)
            }
        }
    })
})
