import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../inputs/Button'
import IconButton from './IconButton'
import { SkeletonBox } from './Skeleton'
import { cx } from '../../utils/cx'
import { type FileSource, type RemoteSourceOptions, isUrlSource, urlHref, sourceName, downloadBlob } from '../../utils/fileSource'
import {
    findOccurrences, findPhrase, indexFromTextContent, normalizeForSearch,
    type ItemPos, type NormalizedText, type Occurrence, type PageIndex,
} from '../../utils/pdfSearch'

/** Target of the programmatic `highlight` prop. */
export interface PdfHighlightTarget {
    /** 1-based page number. */
    page: number
    /** Phrase to highlight; whitespace, hyphenation and ligatures may differ. */
    phrase: string
    /** Which anchor occurrence on the page. Default 0 (the first). */
    occurrence?: number
}

/** Reference to one search match, as reported by `onActiveMatchChange`. */
export interface PdfMatchRef {
    /** 1-based page number. */
    page: number
    /** 0-based index across the whole document. */
    index: number
}

export interface PdfViewerProps {
    source: FileSource
    remote?: RemoteSourceOptions
    initialPage?: number
    /**
     * Controlled current page (1-based). A prop change scrolls to that page;
     * user scrolling reports back through `onPageChange` and is not fought.
     * Out-of-range values clamp to 1..numPages. Omit for uncontrolled mode.
     */
    page?: number
    /** Default `'page-width'`. */
    zoom?: number | 'auto' | 'page-fit' | 'page-width'
    /** Default `true`. */
    toolbar?: boolean | { zoom?: boolean; pager?: boolean; download?: boolean; print?: boolean; search?: boolean }
    /** Side thumbnail rail. Default `false`. */
    thumbnails?: boolean
    /** Selectable text layer. Default `true`. */
    textLayer?: boolean
    /**
     * Programmatic highlight: go to `page`, highlight the first anchor match
     * of `phrase`, and scroll it into view. `null` removes the highlight
     * without scrolling. Resolution is reported via `onHighlightResolved`.
     */
    highlight?: PdfHighlightTarget | null
    /**
     * Override the pdf.js worker URL (e.g. self-hosted for air-gapped / strict-CSP
     * deploys). Defaults to a version-pinned CDN build. Only the first mounted
     * viewer's value takes effect, since the worker is configured process-wide.
     */
    workerSrc?: string
    onLoad?: (info: { numPages: number }) => void
    onError?: (err: Error) => void
    onPageChange?: (page: number) => void
    /** Fired when a search finishes with its occurrence total. */
    onSearchResults?: (r: { query: string; total: number }) => void
    /** Fired when the active search match changes; `null` when none. */
    onActiveMatchChange?: (m: PdfMatchRef | null) => void
    /** Fired when the `highlight` prop resolves against the page text. */
    onHighlightResolved?: (r: { found: boolean }) => void
    /** Overall height. Default 600. */
    height?: number | string
    /** Overall width. Defaults to filling the container. */
    width?: number | string
    className?: string
    style?: React.CSSProperties
}

// ── Lazy pdf.js loader ────────────────────────────────────────────────────────
// pdfjs-dist is heavy; load it (and configure its worker) only on first use so
// it stays out of the main bundle. The worker defaults to the installed version
// on a CDN so it resolves in any bundler without extra config; pass `workerSrc`
// (or set `GlobalWorkerOptions.workerSrc` yourself) for a self-hosted build.
let pdfjsPromise: Promise<any> | null = null
function loadPdfjs(workerSrc?: string): Promise<any> {
    if (pdfjsPromise) return pdfjsPromise
    pdfjsPromise = import('pdfjs-dist').then((pdfjs) => {
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc =
                workerSrc ?? `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
        }
        return pdfjs
    })
    return pdfjsPromise
}

const GAP = 12 // px between pages in continuous scroll
const SEARCH_DEBOUNCE = 220

// pdf.js positions text-layer spans with inline left/top/transform but relies on
// the viewer stylesheet for `position:absolute` (and transparency). The library
// doesn't ship that CSS, so inject the minimal rules once, without them the
// spans stack at the top-left and show through. Scoped to our own class.
const TEXT_LAYER_STYLE_ID = 'oxygen-pdf-textlayer'
const TEXT_LAYER_CSS = `
.oxy-textLayer{position:absolute;inset:0;overflow:clip;line-height:1;text-size-adjust:none;forced-color-adjust:none;transform-origin:0 0;--min-font-size:1;--user-unit:1;--total-scale-factor:calc(var(--scale-factor) * var(--user-unit));--text-scale-factor:calc(var(--total-scale-factor) * var(--min-font-size));--min-font-size-inv:calc(1 / var(--min-font-size))}
.oxy-textLayer span,.oxy-textLayer br{color:transparent;position:absolute;white-space:pre;cursor:text;transform-origin:0 0}
.oxy-textLayer > :not(.markedContent),.oxy-textLayer span.markedContent span:not(.markedContent):not(.oxy-hl):not(.oxy-hl-anchor){--font-height:0;--scale-x:1;--rotate:0deg;font-size:calc(var(--text-scale-factor) * var(--font-height));transform:rotate(var(--rotate)) scaleX(var(--scale-x)) scale(var(--min-font-size-inv))}
.oxy-textLayer span.markedContent{top:0;height:0}
.oxy-textLayer ::selection{background:color-mix(in srgb, var(--color-accent) 35%, transparent)}
.oxy-textLayer span.oxy-hl,.oxy-textLayer span.oxy-hl-anchor{position:static;color:transparent;transform:none;font-size:inherit}
.oxy-textLayer .oxy-hl{background:color-mix(in srgb, var(--color-warning) 40%, transparent);mix-blend-mode:multiply;border-radius:2px}
.oxy-textLayer .oxy-hl-active{background:color-mix(in srgb, var(--color-accent) 45%, transparent)}
.oxy-textLayer .oxy-hl-anchor{background:color-mix(in srgb, var(--color-accent) 30%, transparent);mix-blend-mode:multiply;border-radius:2px}
.oxy-textLayer .oxy-hl-begin{border-radius:2px 0 0 2px}
.oxy-textLayer .oxy-hl-end{border-radius:0 2px 2px 0}
.oxy-textLayer .oxy-hl-middle{border-radius:0}
`
function ensureTextLayerStyles() {
    if (typeof document === 'undefined' || document.getElementById(TEXT_LAYER_STYLE_ID)) return
    const el = document.createElement('style')
    el.id = TEXT_LAYER_STYLE_ID
    el.textContent = TEXT_LAYER_CSS
    document.head.appendChild(el)
}

type Size = { width: number; height: number }

// ── Highlight painting ───────────────────────────────────────────────────────
/** One range to paint on a page, in text-item coordinates. */
interface HighlightRange {
    beginItem: ItemPos
    endItem: ItemPos
    /** Base class: 'oxy-hl', 'oxy-hl oxy-hl-active', or 'oxy-hl-anchor'. */
    className: string
}

const EMPTY_HL: HighlightRange[] = []

interface PaintResult {
    /** offsetTop (px, page space) of the active match, if painted. */
    activeTop: number | null
    /** offsetTop of the programmatic (anchor) highlight, if painted. */
    anchorTop: number | null
}

/**
 * Wrap the given ranges of a rendered text layer in highlight spans, after
 * restoring every previously touched item to its exact original text node.
 * Modeled on pdf.js's TextHighlighter._renderMatches: a cross-item match gets
 * begin / middle / end parts. Mutates only the text-item contents.
 */
function paintHighlights(
    divs: HTMLElement[],
    strs: string[],
    ranges: HighlightRange[],
    touched: Set<number>,
): PaintResult {
    for (const i of touched) {
        const d = divs[i]
        if (d) d.textContent = strs[i] ?? ''
    }
    touched.clear()
    const result: PaintResult = { activeTop: null, anchorTop: null }
    if (ranges.length === 0) return result

    type Seg = { from: number; to: number; cls: string }
    const perItem = new Map<number, Seg[]>()
    for (const r of ranges) {
        const b = r.beginItem
        const e = r.endItem
        if (b.itemIndex > e.itemIndex) continue
        const last = Math.min(e.itemIndex, strs.length - 1)
        for (let i = Math.max(0, b.itemIndex); i <= last; i++) {
            const len = strs[i]?.length ?? 0
            const from = i === b.itemIndex ? Math.min(b.charOffset, len) : 0
            const to = i === e.itemIndex ? Math.min(e.charOffset, len) : len
            if (to <= from) continue
            const multi = b.itemIndex !== e.itemIndex
            const part = multi ? (i === b.itemIndex ? ' oxy-hl-begin' : i === e.itemIndex ? ' oxy-hl-end' : ' oxy-hl-middle') : ''
            const list = perItem.get(i) ?? []
            list.push({ from, to, cls: r.className + part })
            perItem.set(i, list)
        }
    }

    for (const [i, segs] of perItem) {
        const div = divs[i]
        if (!div) continue
        const str = strs[i] ?? ''
        const points = new Set<number>([0, str.length])
        for (const s of segs) { points.add(s.from); points.add(s.to) }
        const sorted = Array.from(points).sort((a, b) => a - b)
        div.textContent = ''
        for (let k = 0; k < sorted.length - 1; k++) {
            const from = sorted[k]
            const to = sorted[k + 1]
            if (to <= from) continue
            const piece = str.slice(from, to)
            const covering = segs.filter((s) => s.from <= from && s.to >= to)
            if (covering.length === 0) {
                div.appendChild(document.createTextNode(piece))
                continue
            }
            const classes = new Set<string>()
            for (const s of covering) for (const c of s.cls.split(' ')) if (c) classes.add(c)
            const span = document.createElement('span')
            span.className = Array.from(classes).join(' ')
            span.textContent = piece
            div.appendChild(span)
            if (result.activeTop == null && classes.has('oxy-hl-active')) result.activeTop = div.offsetTop
            if (result.anchorTop == null && classes.has('oxy-hl-anchor')) result.anchorTop = div.offsetTop
        }
        touched.add(i)
    }
    return result
}

/** Largest index whose cumulative offset is <= y (binary search over offsets). */
function pageIndexAt(offsets: number[], y: number): number {
    let lo = 0
    let hi = offsets.length - 1
    let ans = 0
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (offsets[mid] <= y) { ans = mid; lo = mid + 1 } else hi = mid - 1
    }
    return ans
}

export default function PdfViewer({
    source,
    remote,
    initialPage = 1,
    page: pageProp,
    zoom = 'page-width',
    toolbar = true,
    thumbnails = false,
    textLayer = true,
    highlight,
    workerSrc,
    onLoad,
    onError,
    onPageChange,
    onSearchResults,
    onActiveMatchChange,
    onHighlightResolved,
    height = 600,
    width,
    className = '',
    style,
}: PdfViewerProps) {
    const [pdfjs, setPdfjs] = useState<any>(null)
    const [doc, setDoc] = useState<any>(null)
    const [numPages, setNumPages] = useState(0)
    const [baseSize, setBaseSize] = useState<Size | null>(null) // page-1 size at scale 1 (sizing baseline)
    const [sizes, setSizes] = useState<Size[]>([])              // per-page size at scale 1, refined as pages render
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
    const [error, setError] = useState<Error | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    const scrollRef = useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = useState(0)
    const [viewport, setViewport] = useState({ w: 0, h: 0 })

    const [zoomMode, setZoomMode] = useState(zoom)
    const [page, setPage] = useState(initialPage)
    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery] = useState('')
    const [matches, setMatches] = useState<Array<{ page: number } & Occurrence> | null>(null)
    const [matchIdx, setMatchIdx] = useState(0)
    const [searching, setSearching] = useState(false)
    const [propHl, setPropHl] = useState<({ page: number } & Occurrence) | null>(null)
    const [pageDraft, setPageDraft] = useState('')
    const pageEditing = useRef(false)

    // Search internals: a per-document text cache + a sequence guard so a slow
    // earlier query can never overwrite a newer one's results.
    const pageData = useRef<Map<number, { index: PageIndex; norm: NormalizedText }>>(new Map())
    const searchSeq = useRef(0)
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const measured = useRef<Set<number>>(new Set())
    // Scroll refinement: after a page paints its highlight, scroll to the span.
    const pendingScroll = useRef<{ kind: 'search' | 'anchor'; page: number } | null>(null)

    const tb = toolbar === true ? { zoom: true, pager: true, download: true, print: true, search: true } : toolbar || {}

    // ── Load the document (re-runs on source change / retry) ──────────────────
    useEffect(() => {
        let cancelled = false
        let task: any
        setStatus('loading'); setError(null); setDoc(null); setBaseSize(null); setSizes([])
        pageData.current.clear(); measured.current = new Set()
        searchSeq.current++ // retire any in-flight search against the old document
        setMatches(null); setMatchIdx(0); setPropHl(null); setSearching(false)
        loadPdfjs(workerSrc)
            .then(async (pdfjs) => {
                if (cancelled) return
                setPdfjs(pdfjs)
                const params = isUrlSource(source)
                    ? { url: urlHref(source), httpHeaders: remote?.httpHeaders, withCredentials: remote?.withCredentials }
                    : { data: source instanceof Uint8Array || source instanceof ArrayBuffer ? source : new Uint8Array(await (source as Blob).arrayBuffer()) }
                task = pdfjs.getDocument(params as any)
                const pdf = await task.promise
                if (cancelled) { pdf.destroy?.(); return }
                const first = await pdf.getPage(1)
                const vp = first.getViewport({ scale: 1 })
                if (cancelled) return
                const base = { width: vp.width, height: vp.height }
                setDoc(pdf)
                setNumPages(pdf.numPages)
                setBaseSize(base)
                setSizes(Array.from({ length: pdf.numPages }, () => base)) // refined lazily as pages render
                measured.current.add(1)
                setStatus('ready')
                onLoad?.({ numPages: pdf.numPages })
            })
            .catch((err: Error) => {
                if (cancelled) return
                setStatus('error'); setError(err); onError?.(err)
            })
        return () => { cancelled = true; task?.destroy?.() }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, remote, reloadKey, workerSrc])

    // Destroy the doc on unmount.
    useEffect(() => () => { doc?.destroy?.() }, [doc])

    // Measure the scroll viewport.
    useEffect(() => {
        const el = scrollRef.current
        if (!el || typeof ResizeObserver === 'undefined') return
        const measure = () => setViewport({ w: el.clientWidth, h: el.clientHeight })
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(el)
        return () => ro.disconnect()
    }, [status])

    // A page reports its true intrinsic size once rendered; refine the layout so
    // mixed-size documents get correct offsets (page 1 is the initial estimate).
    const handleMeasure = useCallback((p: number, size: Size) => {
        setSizes((prev) => {
            const cur = prev[p - 1]
            if (cur && Math.abs(cur.width - size.width) < 0.5 && Math.abs(cur.height - size.height) < 0.5) return prev
            const next = prev.slice()
            next[p - 1] = size
            return next
        })
    }, [])

    // ── Scale resolution (fit modes size to page 1) ───────────────────────────
    const scale = useMemo(() => {
        if (!baseSize) return 1
        if (typeof zoomMode === 'number') return zoomMode
        const avail = Math.max(1, (viewport.w || baseSize.width) - 32) // padding allowance
        if (zoomMode === 'page-width' || zoomMode === 'auto') return avail / baseSize.width
        if (zoomMode === 'page-fit') {
            const availH = Math.max(1, (viewport.h || baseSize.height) - 32)
            return Math.min(avail / baseSize.width, availH / baseSize.height)
        }
        return 1
    }, [zoomMode, baseSize, viewport])

    // ── Cumulative per-page offsets at the current scale ──────────────────────
    const { offsets, total } = useMemo(() => {
        const offs = new Array<number>(sizes.length)
        let acc = 0
        for (let i = 0; i < sizes.length; i++) {
            offs[i] = acc
            acc += sizes[i].height * scale + GAP
        }
        return { offsets: offs, total: acc }
    }, [sizes, scale])

    // ── Vertical windowing ────────────────────────────────────────────────────
    const overscan = 1
    const hasLayout = offsets.length > 0 && total > 0
    const startIdx = hasLayout ? Math.max(0, pageIndexAt(offsets, scrollTop) - overscan) : 0
    const endIdx = hasLayout ? Math.min(numPages, pageIndexAt(offsets, scrollTop + viewport.h) + 1 + overscan) : 0
    const visiblePages = Array.from({ length: Math.max(0, endIdx - startIdx) }, (_, i) => startIdx + i + 1)

    const scrollToPage = useCallback((p: number) => {
        const el = scrollRef.current
        if (!el || !offsets.length) return
        const clamped = Math.min(offsets.length, Math.max(1, p))
        el.scrollTo({ top: offsets[clamped - 1] ?? 0, behavior: 'smooth' })
    }, [offsets])

    // Track current page from scroll (centre of viewport).
    useEffect(() => {
        if (!hasLayout) return
        const cur = pageIndexAt(offsets, scrollTop + viewport.h / 2) + 1
        if (cur !== page) { setPage(cur); onPageChange?.(cur) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollTop, offsets, viewport.h, numPages])

    // Mirrors for callbacks that must read fresh layout without re-binding.
    const pageRef = useRef(page); pageRef.current = page
    const offsetsRef = useRef(offsets); offsetsRef.current = offsets
    const visibleRef = useRef<[number, number]>([startIdx, endIdx]); visibleRef.current = [startIdx, endIdx]

    // Jump to initialPage when ready or when the prop changes (uncontrolled only).
    useEffect(() => {
        if (status === 'ready' && initialPage > 1 && pageProp == null) scrollToPage(initialPage)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, initialPage])

    // ── Controlled page: a prop change scrolls; user scroll is not fought ─────
    const prevPageProp = useRef<number | null>(null)
    useEffect(() => {
        if (pageProp == null || status !== 'ready' || numPages === 0) {
            prevPageProp.current = pageProp ?? null
            return
        }
        const target = Math.min(numPages, Math.max(1, Math.round(pageProp)))
        if (prevPageProp.current !== pageProp && target !== pageRef.current) scrollToPage(target)
        prevPageProp.current = pageProp
    }, [pageProp, status, numPages, scrollToPage])

    // ── Search (debounced, cached, race-guarded, per occurrence) ──────────────
    const getPageData = useCallback(async (p: number) => {
        let d = pageData.current.get(p)
        if (!d) {
            const pg = await doc.getPage(p)
            const tc = await pg.getTextContent()
            const index = indexFromTextContent(tc as { items: Array<{ str?: string; hasEOL?: boolean }> })
            d = { index, norm: normalizeForSearch(index.text) }
            pageData.current.set(p, d)
        }
        return d
    }, [doc])

    /** Scroll toward an occurrence; the painted page refines to the exact span. */
    const goToOccurrence = useCallback((occ: { page: number }, kind: 'search' | 'anchor') => {
        pendingScroll.current = { kind, page: occ.page }
        const [s, e] = visibleRef.current
        const mounted = occ.page >= s + 1 && occ.page <= e
        // An unmounted page must scroll into the window first; a mounted page
        // repaints on state change and refines from its paint callback.
        if (!mounted) scrollToPage(occ.page)
    }, [scrollToPage])

    const runSearch = useCallback(async (q: string) => {
        const trimmed = q.trim()
        if (!doc || !trimmed) { setMatches(null); setMatchIdx(0); setSearching(false); return }
        const seq = ++searchSeq.current
        setSearching(true)
        const all: Array<{ page: number } & Occurrence> = []
        try {
            for (let p = 1; p <= numPages; p++) {
                const d = await getPageData(p)
                if (seq !== searchSeq.current) return // a newer query superseded us
                for (const occ of findOccurrences(d.index, trimmed, d.norm)) all.push({ page: p, ...occ })
            }
        } catch {
            // The document was swapped or a page failed mid-search; keep what
            // was collected for the surviving sequence, report nothing stale.
            if (seq !== searchSeq.current) return
        } finally {
            if (seq === searchSeq.current) setSearching(false)
        }
        if (seq !== searchSeq.current) return
        setMatches(all)
        setMatchIdx(0)
        onSearchResults?.({ query: trimmed, total: all.length })
        if (all.length > 0) {
            onActiveMatchChange?.({ page: all[0].page, index: 0 })
            goToOccurrence(all[0], 'search')
        } else {
            onActiveMatchChange?.(null)
        }
    }, [doc, numPages, getPageData, goToOccurrence, onSearchResults, onActiveMatchChange])

    const onQueryChange = useCallback((v: string) => {
        setQuery(v)
        if (searchTimer.current) clearTimeout(searchTimer.current)
        if (!v.trim()) {
            searchSeq.current++
            setMatches(null); setMatchIdx(0); setSearching(false)
            if (pendingScroll.current?.kind === 'search') pendingScroll.current = null
            onActiveMatchChange?.(null)
            return
        }
        searchTimer.current = setTimeout(() => { void runSearch(v) }, SEARCH_DEBOUNCE)
    }, [runSearch, onActiveMatchChange])

    useEffect(() => () => { if (searchTimer.current) clearTimeout(searchTimer.current) }, [])

    const gotoMatch = (dir: 1 | -1) => {
        if (!matches || matches.length === 0) return
        const next = (matchIdx + dir + matches.length) % matches.length
        setMatchIdx(next)
        onActiveMatchChange?.({ page: matches[next].page, index: next })
        goToOccurrence(matches[next], 'search')
    }

    const closeSearch = () => { setShowSearch(false); onQueryChange('') }

    // ── Programmatic highlight (the `highlight` prop) ─────────────────────────
    // Keyed by value, so an inline object literal does not loop the effect.
    const highlightKey = highlight ? `${highlight.page}\u0000${highlight.phrase}\u0000${highlight.occurrence ?? 0}` : null
    useEffect(() => {
        if (status !== 'ready' || !doc) return
        if (!highlight) {
            setPropHl(null) // removes the paint, no scroll
            if (pendingScroll.current?.kind === 'anchor') pendingScroll.current = null
            return
        }
        let cancelled = false
        void (async () => {
            const target = Math.round(highlight.page)
            if (target < 1 || target > numPages) {
                if (!cancelled) { setPropHl(null); onHighlightResolved?.({ found: false }) }
                return
            }
            try {
                const d = await getPageData(target)
                if (cancelled) return
                const occ = findPhrase(d.index, highlight.phrase, { occurrence: highlight.occurrence ?? 0, norm: d.norm })
                if (occ) {
                    setPropHl({ page: target, ...occ })
                    goToOccurrence({ page: target }, 'anchor')
                } else {
                    setPropHl(null)
                    scrollToPage(target)
                }
                onPageChange?.(target) // keeps a controlled parent's `page` in sync
                onHighlightResolved?.({ found: occ != null })
            } catch {
                if (!cancelled) { setPropHl(null); onHighlightResolved?.({ found: false }) }
            }
        })()
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightKey, status, doc, numPages])

    // ── Highlight ranges per page (stable identity across scroll renders) ─────
    const hlByPage = useMemo(() => {
        const map = new Map<number, HighlightRange[]>()
        if (matches) {
            matches.forEach((m, i) => {
                const list = map.get(m.page) ?? []
                list.push({
                    beginItem: m.beginItem,
                    endItem: m.endItem,
                    className: i === matchIdx ? 'oxy-hl oxy-hl-active' : 'oxy-hl',
                })
                map.set(m.page, list)
            })
        }
        if (propHl) {
            const list = map.get(propHl.page) ?? []
            list.push({ beginItem: propHl.beginItem, endItem: propHl.endItem, className: 'oxy-hl-anchor' })
            map.set(propHl.page, list)
        }
        return map
    }, [matches, matchIdx, propHl])

    // After a page paints, refine the pending scroll to the exact span position.
    const handlePainted = useCallback((p: number, tops: PaintResult) => {
        const pending = pendingScroll.current
        const el = scrollRef.current
        if (!pending || pending.page !== p || !el) return
        const top = pending.kind === 'search' ? tops.activeTop : tops.anchorTop
        if (top == null) return
        pendingScroll.current = null
        const target = Math.max(0, (offsetsRef.current[p - 1] ?? 0) + GAP / 2 + top - el.clientHeight / 3)
        el.scrollTo({ top: target, behavior: 'smooth' })
    }, [])

    // ── Download / print (uses the full bytes pdf.js already holds) ───────────
    const getBytes = useCallback(async (): Promise<Uint8Array> => {
        if (doc?.getData) return doc.getData()
        if (source instanceof Uint8Array) return source
        if (source instanceof ArrayBuffer) return new Uint8Array(source)
        if (typeof Blob !== 'undefined' && source instanceof Blob) return new Uint8Array(await source.arrayBuffer())
        throw new Error('No bytes available')
    }, [doc, source])

    const download = useCallback(async () => {
        const bytes = await getBytes()
        downloadBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), sourceName(source) || 'document.pdf')
    }, [getBytes, source])

    const print = useCallback(async () => {
        const bytes = await getBytes()
        const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const iframe = document.createElement('iframe')
        iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
        iframe.src = url
        iframe.onload = () => { try { iframe.contentWindow?.focus(); iframe.contentWindow?.print() } catch { /* ignore */ } }
        document.body.appendChild(iframe)
        setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url) }, 60000)
    }, [getBytes])

    const setZoomNum = (factor: number) => {
        const cur = typeof zoomMode === 'number' ? zoomMode : scale
        setZoomMode(Math.min(5, Math.max(0.25, +(cur * factor).toFixed(2))))
    }
    const zoomPct = Math.round(scale * 100)

    const commitPageDraft = () => {
        pageEditing.current = false
        const n = parseInt(pageDraft, 10)
        if (Number.isFinite(n)) scrollToPage(n)
    }

    // ── States ────────────────────────────────────────────────────────────────
    if (status === 'error') {
        return (
            <div className={cx('flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-8 text-center', className)} style={style}>
                <p className="text-sm font-medium text-status-error">Couldn’t load the PDF</p>
                {error?.message && <p className="max-w-md text-xs text-foreground-muted">{error.message}</p>}
                <Button content="Retry" size="sm" variant="outline" onClick={() => setReloadKey((k) => k + 1)} />
            </div>
        )
    }

    const ready = status === 'ready'
    // Controlled mode shows the clamped prop; uncontrolled shows live scroll state.
    const displayPage = pageProp != null && ready && numPages > 0
        ? Math.min(numPages, Math.max(1, Math.round(pageProp)))
        : page

    return (
        <div className={cx('flex flex-col overflow-hidden rounded-lg border border-border bg-surface-raised', className)} style={{ height, width, ...style }}>
            {toolbar !== false && (
                <div className="flex flex-shrink-0 flex-col border-b border-border bg-surface">
                    <div className="flex items-center gap-1 px-2 py-1.5">
                        {tb.pager && (
                            <div className="flex items-center gap-1">
                                <IconButton type="ghost" size="sm" title="Previous page" onClick={() => scrollToPage(displayPage - 1)} icon={<Chevron dir="up" />} disabled={!ready || displayPage <= 1} />
                                <div className="flex items-center gap-1 text-xs text-foreground-secondary select-none">
                                    <input
                                        value={pageEditing.current ? pageDraft : ready ? String(displayPage) : '–'}
                                        onFocus={() => { pageEditing.current = true; setPageDraft(String(displayPage)) }}
                                        onChange={(e) => setPageDraft(e.target.value.replace(/[^\d]/g, ''))}
                                        onBlur={commitPageDraft}
                                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                                        disabled={!ready}
                                        aria-label="Page number"
                                        className="h-6 w-9 rounded border border-border bg-surface-raised text-center tabular-nums text-foreground outline-none focus:border-accent disabled:opacity-50"
                                    />
                                    <span className="tabular-nums">/ {numPages || '–'}</span>
                                </div>
                                <IconButton type="ghost" size="sm" title="Next page" onClick={() => scrollToPage(displayPage + 1)} icon={<Chevron dir="down" />} disabled={!ready || displayPage >= numPages} />
                            </div>
                        )}

                        {tb.pager && tb.zoom && <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />}

                        {tb.zoom && (
                            <div className="flex items-center gap-1">
                                <IconButton type="ghost" size="sm" title="Zoom out" onClick={() => setZoomNum(1 / 1.2)} icon={<MinusIcon />} disabled={!ready} />
                                <span className="w-10 text-center text-xs tabular-nums text-foreground-secondary select-none">{ready ? `${zoomPct}%` : '–'}</span>
                                <IconButton type="ghost" size="sm" title="Zoom in" onClick={() => setZoomNum(1.2)} icon={<PlusIcon />} disabled={!ready} />
                                <IconButton type="ghost" size="sm" title="Fit width" onClick={() => setZoomMode('page-width')} icon={<FitWidthIcon />} disabled={!ready} />
                                <IconButton type="ghost" size="sm" title="Fit page" onClick={() => setZoomMode('page-fit')} icon={<FitPageIcon />} disabled={!ready} />
                            </div>
                        )}

                        <div className="ml-auto flex items-center gap-1">
                            {tb.search && (
                                <IconButton type={showSearch ? 'bordered' : 'ghost'} size="sm" title="Search" onClick={() => setShowSearch((s) => !s)} icon={<SearchIcon />} disabled={!ready} />
                            )}
                            {(tb.search && (tb.download || tb.print)) && <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />}
                            {tb.download && <IconButton type="ghost" size="sm" title="Download" onClick={download} icon={<DownloadIcon />} disabled={!ready} />}
                            {tb.print && <IconButton type="ghost" size="sm" title="Print" onClick={print} icon={<PrintIcon />} disabled={!ready} />}
                        </div>
                    </div>

                    {tb.search && showSearch && (
                        <div className="flex items-center gap-2 border-t border-border px-2 py-1.5">
                            <SearchIcon />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => onQueryChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') gotoMatch(e.shiftKey ? -1 : 1)
                                    else if (e.key === 'Escape') { e.preventDefault(); closeSearch() }
                                }}
                                placeholder="Find in document…"
                                className="h-7 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted"
                            />
                            <span role="status" aria-live="polite" className="text-xs tabular-nums text-foreground-muted">
                                {searching ? 'Searching…' : matches == null ? '' : matches.length ? `${matchIdx + 1} of ${matches.length}` : 'No matches'}
                            </span>
                            <IconButton type="ghost" size="sm" title="Previous match" onClick={() => gotoMatch(-1)} icon={<Chevron dir="up" />} disabled={!matches?.length} />
                            <IconButton type="ghost" size="sm" title="Next match" onClick={() => gotoMatch(1)} icon={<Chevron dir="down" />} disabled={!matches?.length} />
                            <IconButton type="ghost" size="sm" title="Close search" onClick={closeSearch} icon={<CloseIcon />} />
                        </div>
                    )}
                </div>
            )}

            <div className="flex min-h-0 flex-1">
                {thumbnails && ready && doc && baseSize && (
                    <div className="w-32 flex-shrink-0 overflow-y-auto border-r border-border bg-surface p-2">
                        {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => {
                            const s = sizes[p - 1] ?? baseSize
                            return (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => scrollToPage(p)}
                                    className={cx(
                                        'mb-2 block w-full overflow-hidden rounded border bg-surface-raised transition-colors',
                                        p === page ? 'border-accent ring-1 ring-accent' : 'border-border hover:border-border-strong',
                                    )}
                                    style={{ aspectRatio: `${s.width} / ${s.height}` }}
                                    aria-label={`Page ${p}`}
                                    aria-current={p === page}
                                >
                                    {Math.abs(p - page) <= 8 ? <PdfPage pdfjs={pdfjs} doc={doc} page={p} scale={112 / s.width} textLayer={false} /> : <span className="block py-4 text-center text-xs text-foreground-muted">{p}</span>}
                                </button>
                            )
                        })}
                    </div>
                )}

                <div
                    ref={scrollRef}
                    onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
                    className="relative flex-1 overflow-auto bg-background"
                >
                    {!ready || !baseSize ? (
                        <div className="flex flex-col items-center gap-3 p-6">
                            <SkeletonBox width={Math.min((viewport.w || 528) - 48, 560)} height={680} className="rounded" />
                        </div>
                    ) : numPages === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-foreground-muted">Empty document</div>
                    ) : (
                        <div style={{ height: total, position: 'relative' }}>
                            {visiblePages.map((p) => {
                                const s = sizes[p - 1] ?? baseSize
                                return (
                                    <div
                                        key={p}
                                        style={{ position: 'absolute', top: offsets[p - 1], left: 0, right: 0, display: 'flex', justifyContent: 'center', paddingTop: GAP / 2 }}
                                    >
                                        <div className="relative shadow-md" style={{ width: s.width * scale, height: s.height * scale }}>
                                            <PdfPage
                                                pdfjs={pdfjs}
                                                doc={doc}
                                                page={p}
                                                scale={scale}
                                                textLayer={textLayer}
                                                onMeasure={handleMeasure}
                                                highlights={hlByPage.get(p) ?? EMPTY_HL}
                                                onPainted={handlePainted}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── A single rendered page (canvas + optional text layer + highlights) ────────
function PdfPage({
    pdfjs, doc, page, scale, textLayer, onMeasure, highlights = EMPTY_HL, onPainted,
}: {
    pdfjs: any
    doc: any
    page: number
    scale: number
    textLayer: boolean
    onMeasure?: (page: number, size: Size) => void
    highlights?: HighlightRange[]
    onPainted?: (page: number, tops: PaintResult) => void
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    // The rendered text layer's item elements and their original strings.
    const tlRef = useRef<{ divs: HTMLElement[]; strs: string[] } | null>(null)
    const touched = useRef<Set<number>>(new Set())

    // Repaint closure, refreshed every render so it sees the latest props.
    const paintRef = useRef<() => void>(() => {})
    paintRef.current = () => {
        const tl = tlRef.current
        if (!tl) return
        const tops = paintHighlights(tl.divs, tl.strs, highlights, touched.current)
        onPainted?.(page, tops)
    }

    useEffect(() => {
        let cancelled = false
        let renderTask: any
        tlRef.current = null
        touched.current = new Set()
        ;(async () => {
            const pg = await doc.getPage(page)
            if (cancelled) return
            const viewport = pg.getViewport({ scale })
            onMeasure?.(page, { width: viewport.width / scale, height: viewport.height / scale })
            const canvas = canvasRef.current
            if (!canvas) return
            const ratio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
            canvas.width = Math.floor(viewport.width * ratio)
            canvas.height = Math.floor(viewport.height * ratio)
            canvas.style.width = `${Math.floor(viewport.width)}px`
            canvas.style.height = `${Math.floor(viewport.height)}px`
            const ctx = canvas.getContext('2d')!
            renderTask = pg.render({ canvasContext: ctx, viewport, transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined })
            try { await renderTask.promise } catch { /* cancelled */ return }
            if (cancelled || !textLayer || !textRef.current || !pdfjs?.TextLayer) return
            try {
                ensureTextLayerStyles()
                textRef.current.innerHTML = ''
                textRef.current.style.setProperty('--scale-factor', String(scale))
                const tl = new pdfjs.TextLayer({ textContentSource: pg.streamTextContent(), container: textRef.current, viewport })
                await tl.render()
                if (cancelled) return
                tlRef.current = {
                    divs: Array.from(tl.textDivs as HTMLElement[]),
                    strs: Array.from(tl.textContentItemsStr as string[]),
                }
                paintRef.current()
            } catch { /* text layer optional */ }
        })()
        return () => { cancelled = true; renderTask?.cancel?.() }
    }, [pdfjs, doc, page, scale, textLayer, onMeasure])

    // Repaint when the highlight set changes on an already-rendered layer.
    useEffect(() => {
        if (tlRef.current) paintRef.current()
    }, [highlights])

    return (
        <>
            <canvas ref={canvasRef} className="block bg-white" />
            {textLayer && <div ref={textRef} className="oxy-textLayer" aria-hidden="true" />}
        </>
    )
}

// ── Icons (inline, currentColor) ──────────────────────────────────────────────
const Chevron = ({ dir }: { dir: 'up' | 'down' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'up' ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
    </svg>
)
const MinusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" d="M5 12h14" /></svg>
)
const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
)
const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-foreground-muted" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m21 21-4.3-4.3" /></svg>
)
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" /></svg>
)
const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" /></svg>
)
const PrintIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z" /></svg>
)
const FitWidthIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18m0 0-4-4m4 4-4 4M3 12l4-4m-4 4 4 4" /></svg>
)
const FitPageIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6M9 16h4" /></svg>
)
