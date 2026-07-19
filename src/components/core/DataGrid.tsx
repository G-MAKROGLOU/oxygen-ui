import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import ContextMenu, { type ContextMenuActionItem } from './ContextMenu'

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
    /**
     * Blank rows rendered below the data, like a real spreadsheet's empty grid.
     * Default 0. When `editable`, typing into one emits `onCellEdit` with a
     * `row` index at/after `rows.length` so the consumer can append the row.
     */
    trailingRows?: number
    /** Blank, letter-labelled columns rendered after the data columns (spreadsheet slack). Default 0. */
    trailingCols?: number
    /** `row` is the index into `rows` (stable across sorting; may equal `rows.length`+ for a blank trailing row). */
    onCellEdit?: (e: { row: number; column: string; value: string }) => void
    /** Enable right-click menus: Copy/Cut/Paste on cells, Add/Delete on rows, Add column on headers. Default false. */
    contextMenu?: boolean
    /** Insert a blank row at `index` (from the row right-click menu). */
    onInsertRow?: (index: number) => void
    /** Delete the row at `index` (from the row right-click menu). */
    onDeleteRow?: (index: number) => void
    /** Insert a column at `index` (from the column-header right-click menu). */
    onInsertColumn?: (index: number) => void
    /** Rename a column. When set, headers become editable (double-click / Rename menu). */
    onHeaderEdit?: (index: number, label: string) => void
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

/** Spreadsheet-style column label for a 0-based index: 0→A, 25→Z, 26→AA … */
function colLetter(i: number): string {
    let s = ''
    let n = i
    do { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1 } while (n >= 0)
    return s
}

/**
 * Virtualized (both axes) data grid primitive. Renders only the cells inside
 * the viewport plus an overscan margin, so it stays smooth at tens of thousands
 * of rows. The header and the row-number gutter are pinned by positioning them
 * at the live scroll offset (`top: scrollTop` / `left: scrollLeft`), the same
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
    trailingRows = 0,
    trailingCols = 0,
    onCellEdit,
    contextMenu = false,
    onInsertRow,
    onDeleteRow,
    onInsertColumn,
    onHeaderEdit,
    className = '',
    style,
    emptyState = 'No data',
}: DataGridProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [scroll, setScroll] = useState({ top: 0, left: 0 })
    const [viewport, setViewport] = useState({ w: 0, h: 0 })
    // Cell selection (for highlight + clipboard) and hovered row (for highlight).
    const [selected, setSelected] = useState<{ disp: number; col: number } | null>(null)
    const [hoveredRow, setHoveredRow] = useState<number | null>(null)
    // What the open context menu targets, a cell, a row, or a column header.
    const [ctxTarget, setCtxTarget] = useState<{ kind: 'cell' | 'row'; disp: number } | { kind: 'header'; col: number } | null>(null)
    // `editing.disp` is the on-screen position; the emitted/sourced row is the
    // original index (`order[disp]`), stable across sorting.
    const [editing, setEditing] = useState<{ disp: number; col: number } | null>(null)
    const [draft, setDraft] = useState('')
    const [editingHeader, setEditingHeader] = useState<number | null>(null)
    const [headerDraft, setHeaderDraft] = useState('')
    const [internalSort, setInternalSort] = useState<GridSortState | null>(null)
    const sort = sortProp !== undefined ? sortProp : internalSort

    const gutter = rowNumbers ? GUTTER : 0
    const colSortable = (c: GridColumn) => c.sortable ?? sortable

    // Data columns + blank letter-labelled trailing columns (the spreadsheet
    // "slack"). Slack columns are display-only, add real ones via onInsertColumn.
    const cols = useMemo<GridColumn[]>(() => {
        if (trailingCols <= 0) return columns
        const extra = Array.from({ length: trailingCols }, (_, k) => {
            const idx = columns.length + k
            return { key: `__c${idx}`, label: colLetter(idx), editable: false, sortable: false } as GridColumn
        })
        return [...columns, ...extra]
    }, [columns, trailingCols])

    // Column geometry: resolved widths + prefix offsets.
    const { widths, offsets, totalWidth } = useMemo(() => {
        const widths = cols.map((c) => resolveWidth(c.width))
        const offsets: number[] = []
        let acc = 0
        for (const w of widths) { offsets.push(acc); acc += w }
        return { widths, offsets, totalWidth: acc }
    }, [cols])

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

    // Data rows + blank trailing rows (the spreadsheet "slack").
    const displayRowCount = rows.length + Math.max(0, trailingRows)
    const totalHeight = displayRowCount * rowHeight

    // On-screen row → underlying data index. Data rows go through the sort
    // order; trailing blank rows map to indices at/after rows.length.
    const rowIndexForDisp = (disp: number) => (disp < rows.length ? order[disp] : disp)

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
    const rowEnd = virtualize ? Math.min(displayRowCount, Math.ceil((scroll.top + bodyH) / rowHeight) + overscan) : displayRowCount

    let colStart = 0
    let colEnd = cols.length
    if (virtualize && viewport.w) {
        const viewLeft = scroll.left
        const viewRight = scroll.left + (viewport.w - gutter)
        colStart = Math.max(0, offsets.findIndex((o, i) => o + widths[i] > viewLeft))
        if (colStart < 0) colStart = 0
        colEnd = offsets.findIndex((o) => o > viewRight)
        colEnd = colEnd === -1 ? cols.length : Math.min(cols.length, colEnd + 1)
        colStart = Math.max(0, colStart - overscan)
        colEnd = Math.min(cols.length, colEnd + overscan)
    }

    const visibleRows = Array.from({ length: Math.max(0, rowEnd - rowStart) }, (_, i) => rowStart + i)
    const visibleCols = Array.from({ length: Math.max(0, colEnd - colStart) }, (_, i) => colStart + i)

    const commit = useCallback(() => {
        if (!editing) return
        const col = cols[editing.col]
        const ri = editing.disp < rows.length ? order[editing.disp] : editing.disp
        onCellEdit?.({ row: ri, column: col.key, value: draft })
        setEditing(null)
    }, [editing, cols, draft, onCellEdit, order, rows.length])

    const startEdit = (disp: number, col: number) => {
        const c = cols[col]
        if (!(c.editable ?? editable)) return
        setDraft(displayValue(rows[rowIndexForDisp(disp)]?.[c.key] ?? ''))
        setEditing({ disp, col })
    }

    // ── Header rename ─────────────────────────────────────────────────────────
    const startHeaderEdit = (col: number) => {
        if (!onHeaderEdit) return
        const c = cols[col]
        setHeaderDraft(typeof c.label === 'string' ? c.label : String(c.key))
        setEditingHeader(col)
    }
    const commitHeader = () => {
        if (editingHeader == null) return
        onHeaderEdit?.(editingHeader, headerDraft)
        setEditingHeader(null)
    }

    // ── Clipboard (single selected cell) ──────────────────────────────────────
    const cellText = (sel: { disp: number; col: number }) =>
        displayValue(rows[rowIndexForDisp(sel.disp)]?.[cols[sel.col].key] ?? '')

    const copyCell = useCallback(async () => {
        if (!selected) return
        try { await navigator.clipboard?.writeText(cellText(selected)) } catch { /* clipboard unavailable */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, rows, cols, order])

    const cutCell = useCallback(async () => {
        if (!selected) return
        await copyCell()
        onCellEdit?.({ row: rowIndexForDisp(selected.disp), column: cols[selected.col].key, value: '' })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, copyCell, onCellEdit, cols, order, rows.length])

    const pasteCell = useCallback(async () => {
        if (!selected) return
        let text = ''
        try { text = (await navigator.clipboard?.readText()) ?? '' } catch { return }
        onCellEdit?.({ row: rowIndexForDisp(selected.disp), column: cols[selected.col].key, value: text })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, onCellEdit, cols, order, rows.length])

    // ── Right-click menu items (cell / row / column header) ───────────────────
    const ctxItems = useMemo<ContextMenuActionItem[]>(() => {
        if (ctxTarget?.kind === 'header') {
            const ci = ctxTarget.col
            return [
                { key: 'rename', value: 'Rename column', disabled: !onHeaderEdit, onClick: () => startHeaderEdit(ci) },
                { key: 'left', value: 'Add column to the left', disabled: !onInsertColumn, separatorBefore: true, onClick: () => onInsertColumn?.(ci) },
                { key: 'right', value: 'Add column to the right', disabled: !onInsertColumn, onClick: () => onInsertColumn?.(ci + 1) },
            ]
        }
        if (ctxTarget?.kind === 'row') {
            const ri = rowIndexForDisp(ctxTarget.disp)
            const isData = ctxTarget.disp < rows.length
            return [
                { key: 'above', value: 'Add row above', disabled: !onInsertRow, onClick: () => onInsertRow?.(ri) },
                { key: 'below', value: 'Add row below', disabled: !onInsertRow, onClick: () => onInsertRow?.(Math.min(rows.length, ri + 1)) },
                { key: 'delete', value: 'Delete row', disabled: !isData || !onDeleteRow, onClick: () => onDeleteRow?.(ri) },
            ]
        }
        return [
            { key: 'copy', value: 'Copy', onClick: () => void copyCell() },
            { key: 'cut', value: 'Cut', disabled: !editable, onClick: () => void cutCell() },
            { key: 'paste', value: 'Paste', disabled: !editable, onClick: () => void pasteCell() },
        ]
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctxTarget, rows.length, editable, onInsertRow, onDeleteRow, onInsertColumn, onHeaderEdit, copyCell, cutCell, pasteCell, order])

    const rowHighlighted = (disp: number) => hoveredRow === disp || selected?.disp === disp

    const gridInner = (
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
                const c = cols[ci]
                const sortDir = sort?.key === c.key ? sort.dir : null
                const canSort = colSortable(c)
                const renamable = !!onHeaderEdit
                const isEditingHeader = editingHeader === ci
                return (
                    <div
                        key={`h-${c.key}`}
                        role="columnheader"
                        aria-sort={sortDir ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                        // When headers are renamable, the whole-header click is reserved
                        // for editing (double-click); sorting moves to the caret button.
                        onClick={canSort && !renamable ? () => toggleSort(c.key) : undefined}
                        onDoubleClick={renamable ? () => startHeaderEdit(ci) : undefined}
                        onContextMenu={contextMenu ? () => setCtxTarget({ kind: 'header', col: ci }) : undefined}
                        className={cx(
                            'flex items-center gap-1 border-b border-r border-border bg-surface px-3 font-medium text-foreground-secondary',
                            canSort && !renamable && 'cursor-pointer select-none hover:text-foreground',
                            renamable && 'cursor-default select-none',
                        )}
                        style={{
                            position: 'absolute', top: scroll.top, left: gutter + offsets[ci],
                            width: widths[ci], height: headerHeight, zIndex: 2,
                            justifyContent: c.align === 'right' ? 'flex-end' : c.align === 'center' ? 'center' : 'flex-start',
                        }}
                    >
                        {isEditingHeader ? (
                            <input
                                autoFocus
                                value={headerDraft}
                                onChange={(e) => setHeaderDraft(e.target.value)}
                                onBlur={commitHeader}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') commitHeader()
                                    else if (e.key === 'Escape') setEditingHeader(null)
                                }}
                                className="h-full w-full bg-transparent font-medium text-foreground outline-none"
                            />
                        ) : (
                            <>
                                <span className="truncate">{c.label ?? c.key}</span>
                                {canSort && (
                                    renamable ? (
                                        <button type="button" title="Sort" onClick={(e) => { e.stopPropagation(); toggleSort(c.key) }} className="flex-shrink-0 rounded hover:text-foreground">
                                            <SortCaret dir={sortDir} />
                                        </button>
                                    ) : (
                                        <SortCaret dir={sortDir} />
                                    )
                                )}
                            </>
                        )}
                    </div>
                )
            })}

            {/* Row-number gutter (pinned left, scrolls vertically). Shows the
                on-screen position, like a spreadsheet. */}
            {rowNumbers && visibleRows.map((disp) => {
                const hi = rowHighlighted(disp)
                return (
                    <div
                        key={`g-${disp}`}
                        onMouseEnter={() => setHoveredRow(disp)}
                        onContextMenu={contextMenu ? () => setCtxTarget({ kind: 'row', disp }) : undefined}
                        className={cx(
                            'flex items-center justify-center border-b border-r border-border bg-surface text-xs tabular-nums',
                            hi ? 'font-medium text-foreground' : 'text-foreground-muted',
                        )}
                        style={{ position: 'absolute', left: scroll.left, top: headerHeight + disp * rowHeight, width: gutter, height: rowHeight, zIndex: 1, backgroundColor: hi ? HILITE : undefined }}
                    >
                        {disp + 1}
                    </div>
                )
            })}

            {/* Body cells. `disp` = on-screen row, `ri` = underlying data row
                (a blank trailing row resolves to an index ≥ rows.length). */}
            {visibleRows.map((disp) => {
                const ri = rowIndexForDisp(disp)
                const hi = rowHighlighted(disp)
                return visibleCols.map((ci) => {
                    const c = cols[ci]
                    const isEditing = editing?.disp === disp && editing?.col === ci
                    const isSelected = selected?.disp === disp && selected?.col === ci
                    const canEdit = c.editable ?? editable
                    return (
                        <div
                            key={`${disp}-${c.key}`}
                            role="gridcell"
                            aria-selected={isSelected || undefined}
                            onClick={() => setSelected({ disp, col: ci })}
                            onDoubleClick={() => startEdit(disp, ci)}
                            onMouseEnter={() => setHoveredRow(disp)}
                            onContextMenu={contextMenu ? () => { setSelected({ disp, col: ci }); setCtxTarget({ kind: 'cell', disp }) } : undefined}
                            className={cx(
                                'flex items-center border-b border-r border-border px-3',
                                disp % 2 ? 'bg-surface-raised' : 'bg-surface',
                                canEdit ? 'cursor-text' : 'cursor-default',
                            )}
                            style={{
                                position: 'absolute', top: headerHeight + disp * rowHeight, left: gutter + offsets[ci],
                                width: widths[ci], height: rowHeight, zIndex: isSelected ? 1 : undefined,
                                backgroundColor: isSelected ? SELECT_BG : hi ? HILITE : undefined,
                                boxShadow: isSelected ? SELECT_RING : undefined,
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
    )

    return (
        <div
            ref={scrollRef}
            onScroll={(e) => setScroll({ top: e.currentTarget.scrollTop, left: e.currentTarget.scrollLeft })}
            onMouseLeave={() => setHoveredRow(null)}
            className={cx('relative overflow-auto rounded-lg border border-border bg-surface-raised text-sm', className)}
            style={{ height, width, ...style }}
            role="grid"
            aria-rowcount={rows.length}
            aria-colcount={columns.length}
        >
            {contextMenu ? <ContextMenu items={ctxItems}>{gridInner}</ContextMenu> : gridInner}

            {displayRowCount === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-foreground-muted" style={{ top: headerHeight }}>
                    {emptyState}
                </div>
            )}
        </div>
    )
}

// Accent tints (color-mix keeps them valid against the semantic token in both
// themes). Row hover is faint; the selected cell is stronger + an inset ring.
const HILITE = 'color-mix(in srgb, var(--color-accent) 9%, transparent)'
const SELECT_BG = 'color-mix(in srgb, var(--color-accent) 16%, transparent)'
const SELECT_RING = 'inset 0 0 0 2px var(--color-accent)'

/** Sort direction indicator, both carets dimmed when unsorted, active one lit. */
function SortCaret({ dir }: { dir: GridSortDirection | null }) {
    return (
        <svg viewBox="0 0 16 16" className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 6.5 8 3.5l3 3" className={dir === 'asc' ? 'text-accent' : 'text-foreground-muted opacity-50'} />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5 8 12.5l3-3" className={dir === 'desc' ? 'text-accent' : 'text-foreground-muted opacity-50'} />
        </svg>
    )
}
