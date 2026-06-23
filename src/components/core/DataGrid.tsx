import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'

export type CellValue = string | number | boolean | null

export interface GridColumn {
    key: string
    label?: React.ReactNode
    /** Pixel width. Strings are parsed to px (non-numeric → default). Default 140. */
    width?: number | string
    align?: 'left' | 'center' | 'right'
    /** Per-column override of the grid-wide `editable`. */
    editable?: boolean
}

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
    /** Allow value editing (double-click a cell). Default false. */
    editable?: boolean
    /** Window rows/columns. Default true. Off renders everything (small grids/tests). */
    virtualize?: boolean
    /** Rows/cols rendered beyond the viewport each side. Default 4. */
    overscan?: number
    /** Show the left row-number gutter. Default true. */
    rowNumbers?: boolean
    onCellEdit?: (e: { row: number; column: string; value: string }) => void
    className?: string
    style?: React.CSSProperties
    /** Shown when there are no rows. */
    emptyState?: React.ReactNode
}

const DEFAULT_COL_WIDTH = 140
const GUTTER = 52

function resolveWidth(w: GridColumn['width']): number {
    if (typeof w === 'number') return w
    if (typeof w === 'string') {
        const n = parseFloat(w)
        if (!Number.isNaN(n) && /^\d/.test(w.trim())) return n
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
    editable = false,
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
    const [editing, setEditing] = useState<{ row: number; col: number } | null>(null)
    const [draft, setDraft] = useState('')

    const gutter = rowNumbers ? GUTTER : 0

    // Column geometry — resolved widths + prefix offsets.
    const { widths, offsets, totalWidth } = useMemo(() => {
        const widths = columns.map((c) => resolveWidth(c.width))
        const offsets: number[] = []
        let acc = 0
        for (const w of widths) { offsets.push(acc); acc += w }
        return { widths, offsets, totalWidth: acc }
    }, [columns])

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
        onCellEdit?.({ row: editing.row, column: col.key, value: draft })
        setEditing(null)
    }, [editing, columns, draft, onCellEdit])

    const startEdit = (row: number, col: number) => {
        const c = columns[col]
        if (!(c.editable ?? editable)) return
        setDraft(displayValue(rows[row]?.[c.key] ?? ''))
        setEditing({ row, col })
    }

    return (
        <div
            ref={scrollRef}
            onScroll={(e) => setScroll({ top: e.currentTarget.scrollTop, left: e.currentTarget.scrollLeft })}
            className={cx('relative overflow-auto rounded-lg border border-border bg-surface-raised text-sm', className)}
            style={{ height, ...style }}
            role="grid"
            aria-rowcount={rows.length}
            aria-colcount={columns.length}
        >
            {/* Spacer establishes the full scrollable area. */}
            <div style={{ position: 'relative', width: gutter + totalWidth, height: headerHeight + totalHeight }}>
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
                    return (
                        <div
                            key={`h-${c.key}`}
                            role="columnheader"
                            className="flex items-center border-b border-r border-border bg-surface px-3 font-medium text-foreground-secondary"
                            style={{
                                position: 'absolute', top: scroll.top, left: gutter + offsets[ci],
                                width: widths[ci], height: headerHeight, zIndex: 2,
                                justifyContent: c.align === 'right' ? 'flex-end' : c.align === 'center' ? 'center' : 'flex-start',
                            }}
                        >
                            <span className="truncate">{c.label ?? c.key}</span>
                        </div>
                    )
                })}

                {/* Row-number gutter (pinned left, scrolls vertically). */}
                {rowNumbers && visibleRows.map((ri) => (
                    <div
                        key={`g-${ri}`}
                        className="flex items-center justify-center border-b border-r border-border bg-surface text-xs tabular-nums text-foreground-muted"
                        style={{ position: 'absolute', left: scroll.left, top: headerHeight + ri * rowHeight, width: gutter, height: rowHeight, zIndex: 1 }}
                    >
                        {ri + 1}
                    </div>
                ))}

                {/* Body cells. */}
                {visibleRows.map((ri) =>
                    visibleCols.map((ci) => {
                        const c = columns[ci]
                        const isEditing = editing?.row === ri && editing?.col === ci
                        const canEdit = c.editable ?? editable
                        return (
                            <div
                                key={`${ri}-${c.key}`}
                                role="gridcell"
                                onDoubleClick={() => startEdit(ri, ci)}
                                className={cx(
                                    'flex items-center border-b border-r border-border px-3',
                                    ri % 2 ? 'bg-surface-raised' : 'bg-surface',
                                    canEdit && 'cursor-text',
                                )}
                                style={{
                                    position: 'absolute', top: headerHeight + ri * rowHeight, left: gutter + offsets[ci],
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
                    }),
                )}
            </div>

            {rows.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-foreground-muted" style={{ top: headerHeight }}>
                    {emptyState}
                </div>
            )}
        </div>
    )
}
