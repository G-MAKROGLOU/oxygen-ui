import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../inputs/Button'
import IconButton from './IconButton'
import { SkeletonBox } from './Skeleton'
import { cx } from '../../utils/cx'
import { type FileSource, type RemoteSourceOptions, isUrlSource, urlHref, sourceName, downloadBlob } from '../../utils/fileSource'

export interface PdfViewerProps {
    source: FileSource
    remote?: RemoteSourceOptions
    initialPage?: number
    /** Default `'page-width'`. */
    zoom?: number | 'auto' | 'page-fit' | 'page-width'
    /** Default `true`. */
    toolbar?: boolean | { zoom?: boolean; pager?: boolean; download?: boolean; print?: boolean; search?: boolean }
    /** Side thumbnail rail. Default `false`. */
    thumbnails?: boolean
    /** Selectable text layer. Default `true`. */
    textLayer?: boolean
    /**
     * Override the pdf.js worker URL (e.g. self-hosted for air-gapped / strict-CSP
     * deploys). Defaults to a version-pinned CDN build. Only the first mounted
     * viewer's value takes effect, since the worker is configured process-wide.
     */
    workerSrc?: string
    onLoad?: (info: { numPages: number }) => void
    onError?: (err: Error) => void
    onPageChange?: (page: number) => void
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
.oxy-textLayer{position:absolute;inset:0;overflow:clip;line-height:1;text-size-adjust:none;forced-color-adjust:none;transform-origin:0 0}
.oxy-textLayer span,.oxy-textLayer br{color:transparent;position:absolute;white-space:pre;cursor:text;transform-origin:0 0}
.oxy-textLayer span.markedContent{top:0;height:0}
.oxy-textLayer ::selection{background:color-mix(in srgb, var(--color-accent) 35%, transparent)}
`
function ensureTextLayerStyles() {
    if (typeof document === 'undefined' || document.getElementById(TEXT_LAYER_STYLE_ID)) return
    const el = document.createElement('style')
    el.id = TEXT_LAYER_STYLE_ID
    el.textContent = TEXT_LAYER_CSS
    document.head.appendChild(el)
}

type Size = { width: number; height: number }

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
    zoom = 'page-width',
    toolbar = true,
    thumbnails = false,
    textLayer = true,
    workerSrc,
    onLoad,
    onError,
    onPageChange,
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
    const [matchPages, setMatchPages] = useState<number[] | null>(null)
    const [matchIdx, setMatchIdx] = useState(0)
    const [searching, setSearching] = useState(false)
    const [pageDraft, setPageDraft] = useState('')
    const pageEditing = useRef(false)

    // Search internals: a per-document text cache + a sequence guard so a slow
    // earlier query can never overwrite a newer one's results.
    const pageText = useRef<Map<number, string>>(new Map())
    const searchSeq = useRef(0)
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const measured = useRef<Set<number>>(new Set())

    const tb = toolbar === true ? { zoom: true, pager: true, download: true, print: true, search: true } : toolbar || {}

    // ── Load the document (re-runs on source change / retry) ──────────────────
    useEffect(() => {
        let cancelled = false
        let task: any
        setStatus('loading'); setError(null); setDoc(null); setBaseSize(null); setSizes([])
        pageText.current.clear(); measured.current = new Set()
        setMatchPages(null); setMatchIdx(0)
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

    // Jump to initialPage when ready or when the prop changes.
    useEffect(() => {
        if (status === 'ready' && initialPage > 1) scrollToPage(initialPage)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, initialPage])

    // ── Search (debounced, cached, race-guarded) ──────────────────────────────
    const runSearch = useCallback(async (q: string) => {
        const needle = q.trim().toLowerCase()
        if (!doc || !needle) { setMatchPages(null); setMatchIdx(0); setSearching(false); return }
        const seq = ++searchSeq.current
        setSearching(true)
        const hits: number[] = []
        for (let p = 1; p <= numPages; p++) {
            let text = pageText.current.get(p)
            if (text === undefined) {
                const pg = await doc.getPage(p)
                const tc = await pg.getTextContent()
                const built: string = tc.items.map((it: any) => ('str' in it ? it.str : '')).join(' ').toLowerCase()
                pageText.current.set(p, built)
                text = built
            }
            if (seq !== searchSeq.current) return // a newer query superseded us
            if (text.includes(needle)) hits.push(p)
        }
        if (seq !== searchSeq.current) return
        setMatchPages(hits)
        setMatchIdx(0)
        setSearching(false)
        if (hits.length) scrollToPage(hits[0])
    }, [doc, numPages, scrollToPage])

    const onQueryChange = useCallback((v: string) => {
        setQuery(v)
        if (searchTimer.current) clearTimeout(searchTimer.current)
        if (!v.trim()) { searchSeq.current++; setMatchPages(null); setMatchIdx(0); setSearching(false); return }
        searchTimer.current = setTimeout(() => runSearch(v), SEARCH_DEBOUNCE)
    }, [runSearch])

    useEffect(() => () => { if (searchTimer.current) clearTimeout(searchTimer.current) }, [])

    const gotoMatch = (dir: 1 | -1) => {
        if (!matchPages?.length) return
        const next = (matchIdx + dir + matchPages.length) % matchPages.length
        setMatchIdx(next)
        scrollToPage(matchPages[next])
    }

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

    return (
        <div className={cx('flex flex-col overflow-hidden rounded-lg border border-border bg-surface-raised', className)} style={{ height, width, ...style }}>
            {toolbar !== false && (
                <div className="flex flex-shrink-0 flex-col border-b border-border bg-surface">
                    <div className="flex items-center gap-1 px-2 py-1.5">
                        {tb.pager && (
                            <div className="flex items-center gap-1">
                                <IconButton type="ghost" size="sm" title="Previous page" onClick={() => scrollToPage(page - 1)} icon={<Chevron dir="up" />} disabled={!ready || page <= 1} />
                                <div className="flex items-center gap-1 text-xs text-foreground-secondary select-none">
                                    <input
                                        value={pageEditing.current ? pageDraft : ready ? String(page) : '–'}
                                        onFocus={() => { pageEditing.current = true; setPageDraft(String(page)) }}
                                        onChange={(e) => setPageDraft(e.target.value.replace(/[^\d]/g, ''))}
                                        onBlur={commitPageDraft}
                                        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                                        disabled={!ready}
                                        aria-label="Page number"
                                        className="h-6 w-9 rounded border border-border bg-surface-raised text-center tabular-nums text-foreground outline-none focus:border-accent disabled:opacity-50"
                                    />
                                    <span className="tabular-nums">/ {numPages || '–'}</span>
                                </div>
                                <IconButton type="ghost" size="sm" title="Next page" onClick={() => scrollToPage(page + 1)} icon={<Chevron dir="down" />} disabled={!ready || page >= numPages} />
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
                                onKeyDown={(e) => { if (e.key === 'Enter') gotoMatch(e.shiftKey ? -1 : 1) }}
                                placeholder="Find in document…"
                                className="h-7 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted"
                            />
                            <span className="text-xs tabular-nums text-foreground-muted">
                                {searching ? 'Searching…' : matchPages == null ? '' : matchPages.length ? `${matchIdx + 1} of ${matchPages.length}` : 'No matches'}
                            </span>
                            <IconButton type="ghost" size="sm" title="Previous match" onClick={() => gotoMatch(-1)} icon={<Chevron dir="up" />} disabled={!matchPages?.length} />
                            <IconButton type="ghost" size="sm" title="Next match" onClick={() => gotoMatch(1)} icon={<Chevron dir="down" />} disabled={!matchPages?.length} />
                            <IconButton type="ghost" size="sm" title="Close search" onClick={() => { setShowSearch(false); onQueryChange('') }} icon={<CloseIcon />} />
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
                                            <PdfPage pdfjs={pdfjs} doc={doc} page={p} scale={scale} textLayer={textLayer} onMeasure={handleMeasure} />
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

// ── A single rendered page (canvas + optional text layer) ─────────────────────
function PdfPage({
    pdfjs, doc, page, scale, textLayer, onMeasure,
}: { pdfjs: any; doc: any; page: number; scale: number; textLayer: boolean; onMeasure?: (page: number, size: Size) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const textRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let cancelled = false
        let renderTask: any
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
            } catch { /* text layer optional */ }
        })()
        return () => { cancelled = true; renderTask?.cancel?.() }
    }, [pdfjs, doc, page, scale, textLayer, onMeasure])

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
