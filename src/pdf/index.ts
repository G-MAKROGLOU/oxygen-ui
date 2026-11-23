// Headless PDF phrase search: the matcher behind PdfViewer's `highlight`
// prop, callable from Node (or any DOM-free runtime) without React or CSS.
// Entry point: `@geomak/ui/pdf`.
import {
    findPhrase, indexFromTextContent, normalizeForSearch,
    type PageIndex, type NormalizedText,
} from '../utils/pdfSearch'

export {
    buildPageIndex, findOccurrences, findPhrase, indexFromTextContent, normalizeForSearch,
} from '../utils/pdfSearch'
export type {
    ItemPos, NormalizedText, Occurrence, PageIndex, PageIndexItem, TextContentLike,
} from '../utils/pdfSearch'

/** The slice of pdf.js's PDFDocumentProxy that the search needs. */
export interface PdfDocumentLike {
    numPages: number
    getPage(page: number): Promise<{ getTextContent(): Promise<{ items: Array<{ str?: string; hasEOL?: boolean }> }> }>
    destroy?: () => Promise<void> | void
}

export interface SearchPdfPhraseOptions {
    /** Which anchor occurrence on the page. Default 0 (the first). */
    occurrence?: number
    /**
     * Also search this many pages before and after the given page when the
     * phrase misses there. Nearest page wins; the result reports the page
     * where the phrase was found. Default 0.
     */
    pageTolerance?: number
}

export interface SearchPdfPhraseResult {
    found: boolean
    /** The page the phrase was found on; the requested page on a miss. */
    page: number
    /** Raw page text covered by the match (ligatures as extracted by pdf.js). */
    matchedText?: string
    /** Raw start offset into the page's concatenated item text, inclusive. */
    start?: number
    /** Raw end offset, exclusive. */
    end?: number
}

let nodePdfjsPromise: Promise<unknown> | null = null
function loadNodePdfjs(): Promise<unknown> {
    // The legacy build runs in Node without a DOM; it also runs in browsers.
    return (nodePdfjsPromise ??= import('pdfjs-dist/legacy/build/pdf.mjs'))
}

function isDocument(src: unknown): src is PdfDocumentLike {
    return typeof src === 'object' && src !== null && typeof (src as PdfDocumentLike).getPage === 'function'
}

async function pageData(doc: PdfDocumentLike, page: number): Promise<{ index: PageIndex; norm: NormalizedText }> {
    const pg = await doc.getPage(page)
    const tc = await pg.getTextContent()
    const index = indexFromTextContent(tc)
    return { index, norm: normalizeForSearch(index.text) }
}

/**
 * Search one page of a PDF for a phrase, with exactly the extraction and the
 * matcher that PdfViewer's `highlight` prop uses (NFKC and ligature folding,
 * soft hyphens, line-end hyphenation, quote folding, whitespace collapse,
 * case folding; anchor on the first 8 normalized words). For the same page
 * and phrase, `found` equals what `onHighlightResolved` reports.
 *
 * `source` is a pdf.js document (any build), or the PDF bytes; bytes are
 * parsed with the already-installed `pdfjs-dist` legacy build, which runs in
 * Node without a DOM. A document created here from bytes is destroyed before
 * returning.
 *
 * @example Node
 * ```ts
 * import { searchPdfPhrase } from '@geomak/ui/pdf'
 * import { readFileSync } from 'node:fs'
 * const bytes = new Uint8Array(readFileSync('report.pdf'))
 * const r = await searchPdfPhrase(bytes, 12, 'the proposed system meets the criteria')
 * console.log(r.found, r.page, r.matchedText)
 * ```
 */
export async function searchPdfPhrase(
    source: PdfDocumentLike | Uint8Array | ArrayBuffer,
    page: number,
    phrase: string,
    options: SearchPdfPhraseOptions = {},
): Promise<SearchPdfPhraseResult> {
    const { occurrence = 0, pageTolerance = 0 } = options
    let doc: PdfDocumentLike
    // The loading task owns the document's lifetime in pdfjs-dist 6.5+.
    let ownedTask: { destroy(): Promise<void> } | null = null
    if (isDocument(source)) {
        doc = source
    } else {
        const pdfjs = (await loadNodePdfjs()) as {
            getDocument: (p: { data: Uint8Array }) => { promise: Promise<PdfDocumentLike>; destroy(): Promise<void> }
        }
        // pdf.js transfers (detaches) the buffer it is given; search on a copy
        // so the caller's bytes stay usable across repeated calls.
        const data = (source instanceof Uint8Array ? source : new Uint8Array(source)).slice()
        const task = pdfjs.getDocument({ data })
        doc = await task.promise
        ownedTask = task
    }
    try {
        const target = Math.round(page)
        // Nearest page first: target, -1, +1, -2, +2, ... within tolerance.
        const candidates: number[] = []
        for (let d = 0; d <= Math.max(0, pageTolerance); d++) {
            for (const p of d === 0 ? [target] : [target - d, target + d]) {
                if (p >= 1 && p <= doc.numPages && !candidates.includes(p)) candidates.push(p)
            }
        }
        for (const p of candidates) {
            const { index, norm } = await pageData(doc, p)
            const occ = findPhrase(index, phrase, { occurrence, norm })
            if (occ) {
                return {
                    found: true,
                    page: p,
                    matchedText: index.text.slice(occ.start, occ.end),
                    start: occ.start,
                    end: occ.end,
                }
            }
        }
        return { found: false, page: target }
    } finally {
        await ownedTask?.destroy()
    }
}
