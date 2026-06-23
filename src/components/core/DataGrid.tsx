import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'

export type CellValue = string | number | boolean | null

export interface GridColumn {
    key: string
    label?: React.ReactNode
    /**
     * Column width in pixels. Accepts a number or a px string (`120`, `'120px'`).
     * Relative units (`'50%'`, `'1fr'`, `'auto'`) aren't supported by the
     * virtualizer and fall back to the default. Default 140.
     */
    width?: number | string
    align?: 'left' | 'center' | 'right'
    /** Per-column override of the grid-wide `editable`. */
    editable?: boolean
    /** Per-column override of the grid-wide `sortable`. */
    sortable?: boolean
}

export type GridSortDirection = 'asc' | 'desc'
export interface GridSortState { key: string; dir: GridSortDirection }

export interface DataGridProps {
    columns: GridColumn[]
    /** Plain row records keyed by column key. */
    rows: Array<Record<string, CellValue>>
    /** Default 34. */
    rowHeight?: number
    /** Default 38. */
    headerHeight?: number
    /** Viewport height. Default 480. */
    height?: number | string
    /** Viewport width. Defaults to filling the container. */
    width?: number | string
    /** Allow value editing (double-click a cell). Default false. */
    editable?: boolean
    /** Click headers to sort. Default false. Override per-column via `GridColumn.sortable`. */
    sortable?: boolean
    /** Controlled sort. Omit for uncontrolled (internal) sorting. */
    sort?: GridSortState | null
    /** Fires when the sort changes (header click). */
    onSortChange?: (sort: GridSortState | null) => void
    /** Window rows/columns. Default true. Off renders everything (small grids/tests). */
    virtualize?: boolean
    /** Rows/cols rendered beyond the viewport each side. Default 4. */
    overscan?: number
    /** Show the left row-number gutter. Default true. */
    rowNumbers?: boolean
    /** `row` is the index into `rows` (stable across sorting). */
    onCellEdit?: (e: { row: number; column: string; value: string }) => void
    className?: string
    style?: React.CSSProperties
    /** Shown when there are no rows. */
    emptyState?: React.ReactNode
}

const DEFAULT_COL_WIDTH = 140
const GUTTER = 52
const END_PAD = 12 // breathing room between the last cell and the scrollbar track

function compareValues(a: CellValue, b: CellValue): number {
    if (a == null && b == null) return 0
    if (a == null) return 1 // nulls sort last
    if (b == null) return -1
    if (typeof a === 'number' && typeof b === 'number') return a - b
    if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

// The grid virtualizes by computing pixel offsets, so it needs a concrete px
// width per column. Numbers and bare/px strings ('120', '120px') are honoured;
// relative units the grid can't position against ('50%', '1fr', 'auto') fall
// back to the default rather than being silently truncated to a few pixels.
function resolveWidth(w: GridColumn['width']): number {
    if (typeof w === 'number' && Number.isFinite(w)) return w
    if (typeof w === 'string') {
        const m = /^\s*(\d+(?:\.\d+)?)(px)?\s*$/.exec(w)
        if (m) return parseFloat(m[1])
    }
    return DEFAULT_COL_WIDTH
}

function displayValue(v: CellValue): string {
    if (v == null) return ''
    return String(v)
}

/**
 * Virtualized (both axes) data grid primitive. Renders only the cells inside
 * the viewport plus an overscan margin, so it stays smooth at tens of thousands
 * of rows. The header and the row-number gutter are pinned by positioning them
 * at the live scroll offset (`top: scrollTop` / `left: scrollLeft`) — the same
 * translate-window technique as {@link VirtualList}, extended to two axes.
 *
 * Stateless w.r.t. data: it renders the `rows` it's given and emits
 * `onCellEdit` on commit. Wrap it with {@link Spreadsheet} for multi-sheet
 * switching, file parsing and export.
 */
export default function DataGrid({
    columns,
    rows,
    rowHeight = 34,
    headerHeight = 38,
    height = 480,
    width,
    editable = false,
    sortable = false,
    sort: sortProp,
    onSortChange,
    virtualize = true,
    overscan = 4,
    rowNumbers = true,
    onCellEdit,
    className = '',
    style,
    emptyState = 'No data',
}: DataGridProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [scroll, setScroll] = useState({ top: 0, left: 0 })
    const [viewport, setViewport] = useState({ w: 0, h: 0 })
    // `editing.disp` is the on-screen position; the emitted/sourced row is the
    // original index (`order[disp]`), stable across sorting.
    const [editing, setEditing] = useState<{ disp: number; col: number } | null>(null)
    const [draft, setDraft] = useState('')
    const [internalSort, setInternalSort] = useState<GridSortState | null>(null)
    const sort = sortProp !== undefined ? sortProp : internalSort

    const gutter = rowNumbers ? GUTTER : 0
    const colSortable = (c: GridColumn) => c.sortable ?? sortable

    // Column geometry — resolved widths + prefix offsets.
    const { widths, offsets, totalWidth } = useMemo(() => {
        const widths = columns.map((c) => resolveWidth(c.width))
        const offsets: number[] = []
        let acc = 0
        for (const w of widths) { offsets.push(acc); acc += w }
        return { widths, offsets, totalWidth: acc }
    }, [columns])

    // Display order: original row indices, reordered when a sort is active.
    const order = useMemo(() => {
        const idx = rows.map((_, i) => i)
        if (!sort) return idx
        const dir = sort.dir === 'asc' ? 1 : -1
        return idx.sort((ia, ib) => dir * compareValues(rows[ia]?.[sort.key] ?? null, rows[ib]?.[sort.key] ?? null))
    }, [rows, sort])

    const toggleSort = (key: string) => {
        const nextDir: GridSortDirection | null =
            sort?.key !== key ? 'asc' : sort.dir === 'asc' ? 'desc' : null
        const next = nextDir ? { key, dir: nextDir } : null
        if (sortProp === undefined) setInternalSort(next)
        onSortChange?.(next)
    }

    const totalHeight = rows.length * rowHeight

    useEffect(() => {
        const el = scrollRef.current
        if (!el || typeof ResizeObserver === 'undefined') return
        const measure = () => setViewport({ w: el.clientWidth, h: el.clientHeight })
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // Visible windows.
    const bodyH = (viewport.h || (typeof height === 'number' ? height : 480)) - headerHeight
    const rowStart = virtualize ? Math.max(0, Math.floor(scroll.top / rowHeight) - overscan) : 0
    const rowEnd = virtualize ? Math.min(rows.length, Math.ceil((scroll.top + bodyH) / rowHeight) + overscan) : rows.length

    let colStart = 0
    let colEnd = columns.length
    if (virtualize && viewport.w) {
        const viewLeft = scroll.left
        const viewRight = scroll.left + (viewport.w - gutter)
        colStart = Math.max(0, offsets.findIndex((o, i) => o + widths[i] > viewLeft))
        if (colStart < 0) colStart = 0
        colEnd = offsets.findIndex((o) => o > viewRight)
        colEnd = colEnd === -1 ? columns.length : Math.min(columns.length, colEnd + 1)
        colStart = Math.max(0, colStart - overscan)
        colEnd = Math.min(columns.length, colEnd + overscan)
    }

    const visibleRows = Array.from({ length: Math.max(0, rowEnd - rowStart) }, (_, i) => rowStart + i)
    const visibleCols = Array.from({ length: Math.max(0, colEnd - colStart) }, (_, i) => colStart + i)

    const commit = useCallback(() => {
        if (!editing) return
        const col = columns[editing.col]
        onCellEdit?.({ row: order[editing.disp], column: col.key, value: draft })
        setEditing(null)
    }, [editing, columns, draft, onCellEdit, order])

    const startEdit = (disp: number, col: number) => {
        const c = columns[col]
        if (!(c.editable ?? editable)) return
        setDraft(displayValue(rows[order[disp]]?.[c.key] ?? ''))
        setEditing({ disp, col })
    }

    return (
        <div
            ref={scrollRef}
            onScroll={(e) => setScroll({ top: e.currentTarget.scrollTop, left: e.currentTarget.scrollLeft })}
            className={cx('relative overflow-auto rounded-lg border border-border bg-surface-raised text-sm', className)}
            style={{ height, width, ...style }}
            role="grid"
            aria-rowcount={rows.length}
            aria-colcount={columns.length}
        >
            {/* Spacer establishes the full scrollable area (+ END_PAD so the last
                column/row clears the scrollbar track). */}
            <div style={{ position: 'relative', width: gutter + totalWidth + END_PAD, height: headerHeight + totalHeight + END_PAD }}>
                {/* Corner (pinned top-left). */}
                {rowNumbers && (
                    <div
                        className="border-b border-r border-border bg-surface"
                        style={{ position: 'absolute', top: scroll.top, left: scroll.left, width: gutter, height: headerHeight, zIndex: 3 }}
                    />
                )}

                {/* Header (pinned top, scrolls horizontally). */}
                {visibleCols.map((ci) => {
                    const c = columns[ci]
                    const sortDir = sort?.key === c.key ? sort.dir : null
                    const canSort = colSortable(c)
                    return (
                        <div
                            key={`h-${c.key}`}
                            role="columnheader"
                            aria-sort={sortDir ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                            onClick={canSort ? () => toggleSort(c.key) : undefined}
                            className={cx(
                                'flex items-center gap-1 border-b border-r border-border bg-surface px-3 font-medium text-foreground-secondary',
                                canSort && 'cursor-pointer select-none hover:text-foreground',
                            )}
                            style={{
                                position: 'absolute', top: scroll.top, left: gutter + offsets[ci],
                                width: widths[ci], height: headerHeight, zIndex: 2,
                                justifyContent: c.align === 'right' ? 'flex-end' : c.align === 'center' ? 'center' : 'flex-start',
                            }}
                        >
                            <span className="truncate">{c.label ?? c.key}</span>
                            {canSort && <SortCaret dir={sortDir} />}
                        </div>
                    )
                })}

                {/* Row-number gutter (pinned left, scrolls vertically). Shows the
                    on-screen position, like a spreadsheet. */}
                {rowNumbers && visibleRows.map((disp) => (
                    <div
                        key={`g-${disp}`}
                        className="flex items-center justify-center border-b border-r border-border bg-surface text-xs tabular-nums text-foreground-muted"
                        style={{ position: 'absolute', left: scroll.left, top: headerHeight + disp * rowHeight, width: gutter, height: rowHeight, zIndex: 1 }}
                    >
                        {disp + 1}
                    </div>
                ))}

                {/* Body cells. `disp` = on-screen row, `ri` = original data row. */}
                {visibleRows.map((disp) => {
                    const ri = order[disp]
                    return visibleCols.map((ci) => {
                        const c = columns[ci]
                        const isEditing = editing?.disp === disp && editing?.col === ci
                        const canEdit = c.editable ?? editable
                        return (
                            <div
                                key={`${disp}-${c.key}`}
                                role="gridcell"
                                onDoubleClick={() => startEdit(disp, ci)}
                                className={cx(
                                    'flex items-center border-b border-r border-border px-3',
                                    disp % 2 ? 'bg-surface-raised' : 'bg-surface',
                                    canEdit && 'cursor-text',
                                )}
                                style={{
                                    position: 'absolute', top: headerHeight + disp * rowHeight, left: gutter + offsets[ci],
                                    width: widths[ci], height: rowHeight,
                                    justifyContent: c.align === 'right' ? 'flex-end' : c.align === 'center' ? 'center' : 'flex-start',
                                }}
                            >
                                {isEditing ? (
                                    <input
                                        autoFocus
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        onBlur={commit}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') commit()
                                            else if (e.key === 'Escape') setEditing(null)
                                        }}
                                        className="h-full w-full bg-transparent text-foreground outline-none"
                                    />
                                ) : (
                                    <span className="truncate text-foreground">{displayValue(rows[ri]?.[c.key] ?? '')}</span>
                                )}
                            </div>
                        )
                    })
                })}
            </div>

            {rows.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-foreground-muted" style={{ top: headerHeight }}>
                    {emptyState}
                </div>
            )}
        </div>
    )
}

/** Sort direction indicator — both carets dimmed when unsorted, active one lit. */
function SortCaret({ dir }: { dir: GridSortDirection | null }) {
    return (
        <svg viewBox="0 0 16 16" className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 6.5 8 3.5l3 3" className={dir === 'asc' ? 'text-accent' : 'text-foreground-muted opacity-50'} />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5 8 12.5l3-3" className={dir === 'desc' ? 'text-accent' : 'text-foreground-muted opacity-50'} />
        </svg>
    )
}
