import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../inputs/Button'
import IconButton from './IconButton'
import { SkeletonBox } from './Skeleton'
import { cx } from '../../utils/cx'
import { type FileSource, type RemoteSourceOptions, isUrlSource, urlHref, sourceName } from '../../utils/fileSource'

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
    onLoad?: (info: { numPages: number }) => void
    onError?: (err: Error) => void
    onPageChange?: (page: number) => void
    className?: string
    style?: React.CSSProperties
}

// ── Lazy pdf.js loader ────────────────────────────────────────────────────────
// pdfjs-dist is heavy; load it (and configure its worker) only on first use so
// it stays out of the main bundle. The worker is pinned to the installed
// version on a CDN so it resolves in any bundler without extra config — set
// `GlobalWorkerOptions.workerSrc` yourself beforehand for a fully-offline build.
let pdfjsPromise: Promise<any> | null = null
function loadPdfjs(): Promise<any> {
    if (pdfjsPromise) return pdfjsPromise
    pdfjsPromise = import('pdfjs-dist').then((pdfjs) => {
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
            pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
        }
        return pdfjs
    })
    return pdfjsPromise
}

const GAP = 12 // px between pages in continuous scroll

type Size = { width: number; height: number }

export default function PdfViewer({
    source,
    remote,
    initialPage = 1,
    zoom = 'page-width',
    toolbar = true,
    thumbnails = false,
    textLayer = true,
    onLoad,
    onError,
    onPageChange,
    className = '',
    style,
}: PdfViewerProps) {
    const [pdfjs, setPdfjs] = useState<any>(null)
    const [doc, setDoc] = useState<any>(null)
    const [numPages, setNumPages] = useState(0)
    const [baseSize, setBaseSize] = useState<Size | null>(null) // page-1 size at scale 1
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

    const tb = toolbar === true ? { zoom: true, pager: true, download: true, print: true, search: true } : toolbar || {}

    // ── Load the document (re-runs on source change / retry) ──────────────────
    useEffect(() => {
        let cancelled = false
        let task: any
        setStatus('loading'); setError(null); setDoc(null); setBaseSize(null)
        loadPdfjs()
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
                setDoc(pdf)
                setNumPages(pdf.numPages)
                setBaseSize({ width: vp.width, height: vp.height })
                setStatus('ready')
                onLoad?.({ numPages: pdf.numPages })
            })
            .catch((err: Error) => {
                if (cancelled) return
                setStatus('error'); setError(err); onError?.(err)
            })
        return () => { cancelled = true; task?.destroy?.() }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, remote, reloadKey])

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

    // ── Scale resolution ──────────────────────────────────────────────────────
    const scale = useMemo(() => {
        if (!baseSize) return 1
        if (typeof zoomMode === 'number') return zoomMode
        const avail = Math.max(0, (viewport.w || baseSize.width) - 32) // padding allowance
        if (zoomMode === 'page-width' || zoomMode === 'auto') return avail / baseSize.width
        if (zoomMode === 'page-fit') {
            const availH = Math.max(0, (viewport.h || baseSize.height) - 32)
            return Math.min(avail / baseSize.width, availH / baseSize.height)
        }
        return 1
    }, [zoomMode, baseSize, viewport])

    const pageH = baseSize ? baseSize.height * scale + GAP : 0
    const pageW = baseSize ? baseSize.width * scale : 0
    const total = numPages * pageH

    // ── Vertical windowing (same technique as VirtualList) ────────────────────
    const overscan = 1
    const startIdx = pageH ? Math.max(0, Math.floor(scrollTop / pageH) - overscan) : 0
    const endIdx = pageH ? Math.min(numPages, Math.ceil((scrollTop + viewport.h) / pageH) + overscan) : 0
    const visiblePages = Array.from({ length: Math.max(0, endIdx - startIdx) }, (_, i) => startIdx + i + 1)

    // Track current page from scroll.
    useEffect(() => {
        if (!pageH) return
        const cur = Math.min(numPages, Math.max(1, Math.floor((scrollTop + viewport.h / 2) / pageH) + 1))
        if (cur !== page) { setPage(cur); onPageChange?.(cur) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollTop, pageH, viewport.h, numPages])

    const scrollToPage = useCallback((p: number) => {
        const el = scrollRef.current
        if (!el || !pageH) return
        el.scrollTo({ top: (p - 1) * pageH, behavior: 'smooth' })
    }, [pageH])

    // Jump to initialPage once ready.
    useEffect(() => {
        if (status === 'ready' && initialPage > 1) scrollToPage(initialPage)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status])

    // ── Search (find pages containing the query) ──────────────────────────────
    const runSearch = useCallback(async (q: string) => {
        setQuery(q)
        if (!doc || !q.trim()) { setMatchPages(null); setMatchIdx(0); return }
        const needle = q.toLowerCase()
        const hits: number[] = []
        for (let p = 1; p <= numPages; p++) {
            const pg = await doc.getPage(p)
            const tc = await pg.getTextContent()
            const text = tc.items.map((it: any) => ('str' in it ? it.str : '')).join(' ').toLowerCase()
            if (text.includes(needle)) hits.push(p)
        }
        setMatchPages(hits)
        setMatchIdx(0)
        if (hits.length) scrollToPage(hits[0])
    }, [doc, numPages, scrollToPage])

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
        const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = sourceName(source) || 'document.pdf'
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
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

    return (
        <div className={cx('flex flex-col overflow-hidden rounded-lg border border-border bg-surface-raised', className)} style={{ height: 600, ...style }}>
            {toolbar !== false && (
                <div className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-2 py-1.5">
                    {tb.pager && (
                        <div className="flex items-center gap-1">
                            <IconButton type="ghost" size="sm" title="Previous page" onClick={() => scrollToPage(Math.max(1, page - 1))} icon={<Chevron dir="up" />} disabled={status !== 'ready'} />
                            <span className="px-1 text-xs tabular-nums text-foreground-secondary select-none">{status === 'ready' ? page : '–'} / {numPages || '–'}</span>
                            <IconButton type="ghost" size="sm" title="Next page" onClick={() => scrollToPage(Math.min(numPages, page + 1))} icon={<Chevron dir="down" />} disabled={status !== 'ready'} />
                        </div>
                    )}
                    {tb.zoom && (
                        <div className="ml-1 flex items-center gap-1">
                            <IconButton type="ghost" size="sm" title="Zoom out" onClick={() => setZoomNum(1 / 1.2)} icon={<span className="text-base leading-none">−</span>} disabled={status !== 'ready'} />
                            <IconButton type="ghost" size="sm" title="Zoom in" onClick={() => setZoomNum(1.2)} icon={<span className="text-base leading-none">+</span>} disabled={status !== 'ready'} />
                            <IconButton type="ghost" size="sm" title="Fit width" onClick={() => setZoomMode('page-width')} icon={<FitWidthIcon />} disabled={status !== 'ready'} />
                            <IconButton type="ghost" size="sm" title="Fit page" onClick={() => setZoomMode('page-fit')} icon={<FitPageIcon />} disabled={status !== 'ready'} />
                        </div>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                        {tb.search && (
                            <IconButton type="ghost" size="sm" title="Search" onClick={() => setShowSearch((s) => !s)} icon={<SearchIcon />} disabled={status !== 'ready'} />
                        )}
                        {tb.download && <IconButton type="ghost" size="sm" title="Download" onClick={download} icon={<DownloadIcon />} disabled={status !== 'ready'} />}
                        {tb.print && <IconButton type="ghost" size="sm" title="Print" onClick={print} icon={<PrintIcon />} disabled={status !== 'ready'} />}
                    </div>
                    {tb.search && showSearch && (
                        <div className="flex w-full items-center gap-2 pt-1">
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => runSearch(e.target.value)}
                                placeholder="Find in document…"
                                className="h-7 flex-1 rounded-md border border-border bg-surface px-2 text-sm text-foreground outline-none focus:border-accent"
                            />
                            <span className="text-xs tabular-nums text-foreground-muted">
                                {matchPages == null ? '' : matchPages.length ? `${matchIdx + 1}/${matchPages.length} pages` : 'no matches'}
                            </span>
                            <IconButton type="ghost" size="sm" title="Previous match" onClick={() => gotoMatch(-1)} icon={<Chevron dir="up" />} disabled={!matchPages?.length} />
                            <IconButton type="ghost" size="sm" title="Next match" onClick={() => gotoMatch(1)} icon={<Chevron dir="down" />} disabled={!matchPages?.length} />
                        </div>
                    )}
                </div>
            )}

            <div className="flex min-h-0 flex-1">
                {thumbnails && status === 'ready' && doc && baseSize && (
                    <div className="w-32 flex-shrink-0 overflow-y-auto border-r border-border bg-surface p-2">
                        {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => scrollToPage(p)}
                                className={cx(
                                    'mb-2 block w-full overflow-hidden rounded border bg-surface-raised transition-colors',
                                    p === page ? 'border-accent ring-1 ring-accent' : 'border-border hover:border-border-strong',
                                )}
                                style={{ aspectRatio: `${baseSize.width} / ${baseSize.height}` }}
                                aria-label={`Page ${p}`}
                            >
                                {Math.abs(p - page) <= 8 ? <PdfPage pdfjs={pdfjs} doc={doc} page={p} scale={112 / baseSize.width} textLayer={false} /> : <span className="block py-4 text-center text-xs text-foreground-muted">{p}</span>}
                            </button>
                        ))}
                    </div>
                )}

                <div
                    ref={scrollRef}
                    onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
                    className="relative flex-1 overflow-auto bg-background"
                >
                    {status === 'loading' || !baseSize ? (
                        <div className="flex flex-col items-center gap-3 p-6">
                            <SkeletonBox width={Math.min(viewport.w - 48, 560) || 480} height={680} className="rounded" />
                        </div>
                    ) : numPages === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-foreground-muted">Empty document</div>
                    ) : (
                        <div style={{ height: total, position: 'relative' }}>
                            {visiblePages.map((p) => (
                                <div
                                    key={p}
                                    style={{ position: 'absolute', top: (p - 1) * pageH, left: 0, right: 0, height: pageH, display: 'flex', justifyContent: 'center', paddingTop: GAP / 2, paddingBottom: GAP / 2 }}
                                >
                                    <div className="relative shadow-md" style={{ width: pageW, height: baseSize.height * scale }}>
                                        <PdfPage pdfjs={pdfjs} doc={doc} page={p} scale={scale} textLayer={textLayer} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── A single rendered page (canvas + optional text layer) ─────────────────────
function PdfPage({ pdfjs, doc, page, scale, textLayer }: { pdfjs: any; doc: any; page: number; scale: number; textLayer: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const textRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let cancelled = false
        let renderTask: any
        ;(async () => {
            const pg = await doc.getPage(page)
            if (cancelled) return
            const viewport = pg.getViewport({ scale })
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
                textRef.current.innerHTML = ''
                textRef.current.style.setProperty('--scale-factor', String(scale))
                const tl = new pdfjs.TextLayer({ textContentSource: pg.streamTextContent(), container: textRef.current, viewport })
                await tl.render()
            } catch { /* text layer optional */ }
        })()
        return () => { cancelled = true; renderTask?.cancel?.() }
    }, [pdfjs, doc, page, scale, textLayer])

    return (
        <>
            <canvas ref={canvasRef} className="block bg-white" />
            {textLayer && <div ref={textRef} className="textLayer pointer-events-auto absolute inset-0 overflow-hidden leading-none" style={{ opacity: 0.25 }} aria-hidden="true" />}
        </>
    )
}

// ── Icons (inline, currentColor) ──────────────────────────────────────────────
const Chevron = ({ dir }: { dir: 'up' | 'down' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'up' ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
    </svg>
)
const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m21 21-4.3-4.3" /></svg>
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
