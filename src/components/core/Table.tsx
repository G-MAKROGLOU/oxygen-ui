import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import SearchInput from '../inputs/SearchInput'
import MenuButton from './MenuButton'
import Button from '../inputs/Button'
import { SkeletonBox } from './Skeleton'

/** ─────────────────── types ─────────────────── */

/**
 * Column descriptor for the Table.
 *
 * The generic `T` is the shape of a row — `keyBind` must be one of T's
 * string-keyed properties, and `component(cellValue, row)` receives the
 * matching value with full type inference. When used without a generic
 * (`TableColumn[]`), `T` falls back to `Record<string, any>` for backwards
 * compatibility — narrower typing is preferred whenever possible:
 *
 * ```ts
 * type Vessel = { id: number; name: string; status: 'At Sea' | 'In Port' }
 * const cols: TableColumn<Vessel>[] = [
 *   { key: 'name', label: 'Name', keyBind: 'name' }, // cellValue inferred as string
 * ]
 * ```
 */
export interface TableColumn<T extends Record<string, any> = Record<string, any>> {
    /** React reconciliation key for the column itself. */
    key: React.Key
    label: React.ReactNode
    /** Property on the row to read for this column. */
    keyBind: keyof T & string
    /** Custom cell renderer. Receives the cell value and the full row. */
    component?: (cellValue: T[keyof T], row: T) => React.ReactNode
    /** Explicit column width (CSS length or px number). Optional — defaults to auto. */
    width?: string | number
    /** Text alignment for both header and cells. Defaults to `'center'`. */
    align?: 'left' | 'center' | 'right'
    /** Allow clicking this column's header to sort by it. */
    sortable?: boolean
    /** Custom value used when sorting (defaults to `row[keyBind]`). */
    sortAccessor?: (row: T) => string | number | boolean | Date | null | undefined
    /** Make this column's cells inline-editable. Pair with `onCellEdit`. */
    editable?: boolean
    /** Custom inline editor (overrides the built-in text input). */
    editor?: (args: EditorArgs<T>) => React.ReactNode
}

export interface EditorArgs<T extends Record<string, any> = Record<string, any>> {
    value: T[keyof T]
    row: T
    /** Commit a new value (fires `onCellEdit`) and leave edit mode. */
    commit: (next: string) => void
    /** Discard changes and leave edit mode. */
    cancel: () => void
}

export interface CellEditInfo<T extends Record<string, any> = Record<string, any>> {
    row: T
    key: keyof T & string
    value: string
    /** Index of the row within the current page. */
    rowIndex: number
}

export type SortDirection = 'asc' | 'desc'
export interface SortState {
    key: string
    direction: SortDirection
}

export interface SearchOptions<T extends Record<string, any> = Record<string, any>> {
    /** Restrict search to these row keys. Default: every value in the row. */
    keys?: (keyof T & string)[]
    /** Match strategy. Default `'contains'`. */
    matchMode?: 'contains' | 'startsWith' | 'equals'
    /** Case-sensitive matching. Default `false`. */
    caseSensitive?: boolean
    /** Debounce the filter (ms) — useful for large lists. Default `0`. */
    debounceMs?: number
    /** Input placeholder. */
    placeholder?: string
    /** Full custom matcher — overrides keys / matchMode / caseSensitive. */
    predicate?: (row: T, term: string) => boolean
}

export interface PaginationOptions {
    enabled?: boolean
    perPage?: number
    withPicker?: boolean
    /** Where to render the pager: `'top'` (default), `'bottom'`, or `'both'`. */
    position?: 'top' | 'bottom' | 'both'
    serverSide?: boolean
    /** Server-side: current 1-based page number */
    page?: number
    /** Server-side: total page count */
    maxPage?: number
    /** Server-side: total row count (used to calculate maxPage) */
    totalCount?: number
    pickerOptions?: Array<{ key: number; value: number; label: number }>
    onPageChange?: (page: number) => void
    onPerPageChange?: (perPage: number) => void
}

export interface ExpandRowOptions<T extends Record<string, any> = Record<string, any>> {
    enabled?: boolean
    /** Icon shown when collapsed. If no `collapseIcon` is given, this icon rotates 180° when open. */
    expandIcon?: React.ReactNode
    /** Distinct icon shown when expanded. When set, the icons swap instead of rotating. */
    collapseIcon?: React.ReactNode
    expandComponent?: (row: T) => React.ReactNode
}

export interface TableProps<T extends Record<string, any> = Record<string, any>> {
    columns?: TableColumn<T>[]
    rows?: T[]
    /**
     * Returns a stable key for each row, used for React reconciliation AND
     * for tracking expanded state when `expandRow.enabled` is true.
     * Defaults to the row index — fine for static lists, but pass an
     * explicit getter (e.g. `(row) => row.id`) if rows can be reordered or
     * filtered while expand state should persist.
     */
    getRowKey?: (row: T, index: number) => React.Key
    pagination?: PaginationOptions
    expandRow?: ExpandRowOptions<T>
    hasSearch?: boolean
    /** Fine-tune search: keys, match mode, debounce, placeholder, custom predicate. */
    search?: SearchOptions<T>
    /** Initial sort (uncontrolled). */
    defaultSort?: SortState | null
    /** Fires when the sort column/direction changes, or clears (`null`). Use for server-side sorting. */
    onSortChange?: (sort: SortState | null) => void
    /** Fires when an editable cell commits a new value. */
    onCellEdit?: (info: CellEditInfo<T>) => void
    footer?: React.ReactNode
    header?: React.ReactNode
    /**
     * When `true`, the body renders skeleton rows (one per column with the
     * shared shimmer animation) instead of data. Use during initial data
     * fetch, server-side pagination transitions, or any time the dataset is
     * not yet ready. Combine with `pagination.serverSide` for the canonical
     * "loading next page" pattern.
     */
    loading?: boolean
    /** Number of skeleton rows to render when `loading` is true. Default `8`. */
    loadingRowCount?: number
    /** Extra classes merged onto the table wrapper root. */
    className?: string
    /** Inline style on the table wrapper root. */
    style?: React.CSSProperties
}

/** ─────────────────── defaults ─────────────────── */
const DEFAULT_PICKER: NonNullable<PaginationOptions['pickerOptions']> = [
    { key: 1, value: 5,  label: 5  },
    { key: 2, value: 10, label: 10 },
    { key: 3, value: 15, label: 15 },
    { key: 4, value: 20, label: 20 },
]

const DEFAULT_PAGINATION: PaginationOptions = {
    enabled: true,
    perPage: 15,
    withPicker: true,
    pickerOptions: DEFAULT_PICKER,
}

const DEFAULT_EXPAND: ExpandRowOptions = {
    enabled: false,
}

/** ─────────────────── helpers ─────────────────── */

function createDatasets<T>(rows: T[], perPage: number | null): T[][] {
    if (!perPage) return [rows.slice()]
    const all: T[][] = []
    for (let i = 0; i < rows.length; i += perPage) {
        all.push(rows.slice(i, i + perPage))
    }
    return all
}

/**
 * Default row-key strategy — index-based. Stable across renders for static
 * lists; pass an explicit `getRowKey` for any list that mutates.
 */
const defaultGetRowKey = (_row: unknown, index: number): React.Key => index

const cellAlign = (align: TableColumn['align']) =>
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'

/** ─────────────────── sub-components ─────────────────── */

/** Comparator for client-side sorting — numeric-aware, null-safe. */
function compareValues(a: unknown, b: unknown): number {
    if (a == null && b == null) return 0
    if (a == null) return -1
    if (b == null) return 1
    if (typeof a === 'number' && typeof b === 'number') return a - b
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
    if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

/** Up/down chevron pair; the active direction is highlighted in the accent. */
function SortGlyph({ direction }: { direction?: SortDirection }) {
    return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true" className="shrink-0">
            <path d="M8 11l4-4 4 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                className={direction === 'asc' ? 'text-accent' : 'text-foreground-muted'} opacity={direction === 'asc' ? 1 : 0.45} />
            <path d="M8 13l4 4 4-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                className={direction === 'desc' ? 'text-accent' : 'text-foreground-muted'} opacity={direction === 'desc' ? 1 : 0.45} />
        </svg>
    )
}

function TableHeader<T extends Record<string, any>>({
    columns,
    hasExpand,
    sort,
    onSort,
}: {
    columns: TableColumn<T>[]
    hasExpand: boolean
    sort: SortState | null
    onSort: (col: TableColumn<T>) => void
}) {
    return (
        <thead className="bg-surface-raised border-b border-border">
            <tr>
                {hasExpand && <th aria-hidden="true" className="w-9" />}
                {columns.map((col) => {
                    const active = sort?.key === col.keyBind
                    const dir = active ? sort!.direction : undefined
                    const justify = col.align === 'left' ? 'justify-start' : col.align === 'right' ? 'justify-end' : 'justify-center'
                    return (
                        <th
                            key={col.key}
                            scope="col"
                            aria-sort={col.sortable ? (active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                            className={`${cellAlign(col.align)} text-sm font-semibold text-foreground py-3 px-3`}
                            style={col.width != null ? { width: col.width } : undefined}
                        >
                            {col.sortable ? (
                                <button
                                    type="button"
                                    onClick={() => onSort(col)}
                                    className={`inline-flex items-center gap-1.5 ${justify} w-full select-none rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${active ? 'text-accent' : 'hover:text-accent'}`}
                                >
                                    <span>{col.label}</span>
                                    <SortGlyph direction={dir} />
                                </button>
                            ) : (
                                col.label
                            )}
                        </th>
                    )
                })}
            </tr>
        </thead>
    )
}

// Chevron (down when collapsed) — rotates to point up when the row expands, so
// the open/closed state is actually visible (the old plus-in-circle looked
// identical rotated). Override per-row via expandRow.expandIcon / collapseIcon.
const DefaultExpandIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-4 h-4 text-foreground-muted"
        aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
)

/**
 * An inline-editable cell: shows the value (or `column.component`) until
 * clicked, then a text input (or a custom `column.editor`). Enter / blur
 * commits via `onCellEdit`; Escape cancels. The data stays controlled by the
 * consumer — update your rows in the `onCellEdit` handler.
 */
function EditableCell<T extends Record<string, any>>({
    col,
    row,
    rowIndex,
    onCellEdit,
}: {
    col: TableColumn<T>
    row: T
    rowIndex: number
    onCellEdit?: (info: CellEditInfo<T>) => void
}) {
    const [editing, setEditing] = useState(false)
    const value = row[col.keyBind] as T[keyof T]
    const commit = (next: string) => {
        setEditing(false)
        onCellEdit?.({ row, key: col.keyBind, value: next, rowIndex })
    }
    const cancel = () => setEditing(false)

    if (editing) {
        if (col.editor) return <>{col.editor({ value, row, commit, cancel })}</>
        return (
            <input
                autoFocus
                size={1}
                defaultValue={value == null ? '' : String(value)}
                onBlur={(e) => commit(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); commit((e.target as HTMLInputElement).value) }
                    else if (e.key === 'Escape') { e.preventDefault(); cancel() }
                }}
                aria-label={`Edit ${typeof col.label === 'string' ? col.label : col.keyBind}`}
                className="box-border w-full min-w-0 rounded border border-accent bg-surface px-2 py-1 text-sm text-foreground outline-none"
            />
        )
    }
    return (
        <button
            type="button"
            onClick={() => setEditing(true)}
            title="Click to edit"
            className={`${cellAlign(col.align)} w-full cursor-text rounded px-1 py-0.5 hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
        >
            {col.component ? col.component(value, row) : (value as React.ReactNode)}
        </button>
    )
}

function TableBody<T extends Record<string, any>>({
    columns,
    rows,
    expandRow,
    getRowKey,
    onCellEdit,
}: {
    columns: TableColumn<T>[]
    rows: T[]
    expandRow: ExpandRowOptions<T>
    getRowKey: (row: T, index: number) => React.Key
    onCellEdit?: (info: CellEditInfo<T>) => void
}) {
    // Expand state is keyed by the row's stable key — survives reorder/filter
    // as long as `getRowKey` returns the same value for the same row.
    const [expanded, setExpanded] = useState<Set<React.Key>>(() => new Set())
    const reduced = useReducedMotion()

    const toggleRow = (rowKey: React.Key) => {
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(rowKey)) next.delete(rowKey)
            else next.add(rowKey)
            return next
        })
    }

    const hasExpand = !!expandRow.enabled
    const expandColCount = columns.length + (hasExpand ? 1 : 0)

    return (
        <tbody>
            {rows.map((row, i) => {
                const rowKey = getRowKey(row, i)
                const isExpanded = expanded.has(rowKey)
                return (
                    <React.Fragment key={rowKey}>
                        <tr
                            className={`border-b border-border hover:bg-surface-raised transition-colors duration-150 ${
                                i % 2 === 0 ? 'bg-surface' : 'bg-surface-raised'
                            }`}
                        >
                            {hasExpand && (
                                <td className="p-0 align-middle w-9">
                                    <button
                                        type="button"
                                        onClick={() => toggleRow(rowKey)}
                                        aria-expanded={isExpanded}
                                        aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                                        className={`w-9 h-9 inline-flex items-center justify-center rounded-md text-foreground-muted hover:text-foreground transition-[transform,color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                            isExpanded && !expandRow.collapseIcon ? 'rotate-180' : ''
                                        }`}
                                    >
                                        {isExpanded
                                            ? expandRow.collapseIcon ?? expandRow.expandIcon ?? DefaultExpandIcon
                                            : expandRow.expandIcon ?? DefaultExpandIcon}
                                    </button>
                                </td>
                            )}
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={`${cellAlign(col.align)} text-sm text-foreground py-2 px-3 align-middle`}
                                >
                                    {col.editable ? (
                                        <EditableCell col={col} row={row} rowIndex={i} onCellEdit={onCellEdit} />
                                    ) : col.component ? (
                                        col.component(row[col.keyBind] as T[keyof T], row)
                                    ) : (
                                        row[col.keyBind] as React.ReactNode
                                    )}
                                </td>
                            ))}
                        </tr>

                        {/* Expansion row is always present; the panel animates
                            its height + fade via AnimatePresence so the content
                            mounts only while open (and during the collapse
                            transition). The border lives on the panel so a
                            collapsed row leaves no stray divider. */}
                        {hasExpand && (
                            <tr className="bg-surface">
                                <td colSpan={expandColCount} className="p-0">
                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                key="expand"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={
                                                    reduced
                                                        ? { duration: 0 }
                                                        : { height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.2 } }
                                                }
                                                style={{ overflow: 'hidden' }}
                                                className="border-b border-border"
                                            >
                                                <div className="p-3">{expandRow.expandComponent?.(row)}</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                )
            })}
        </tbody>
    )
}

function Pagination({
    activePage,
    onPageChange,
    maxPage,
    options,
    onPerPageChange,
    serverSide = false,
}: {
    activePage: number
    onPageChange: (page: number) => void
    maxPage: number
    options: PaginationOptions
    onPerPageChange: (perPage: number) => void
    serverSide?: boolean
}) {
    const picker = options.pickerOptions ?? DEFAULT_PICKER
    const matchedOption = picker.find(
        (o) => o.label === options.perPage || o.value === options.perPage
    )
    const [perPageKey, setPerPageKey] = useState(() => matchedOption?.key ?? picker[0]?.key)
    const displayPerPageKey = serverSide ? matchedOption?.key ?? perPageKey : perPageKey

    useEffect(() => {
        if (serverSide && options.perPage != null) {
            const next = picker.find((o) => o.label === options.perPage || o.value === options.perPage)
            if (next) setPerPageKey(next.key)
        }
    }, [serverSide, options.perPage, picker])

    const currentOpt = picker.find((o) => o.key === displayPerPageKey)
    const currentPerPageLabel = currentOpt?.label ?? currentOpt?.value ?? options.perPage ?? ''

    // Square, flat, neutral icon buttons — same primitive/height/border as the
    // per-page MenuButton so the whole strip reads as one cohesive group.
    // Match the input focus style (border turns accent, no ring band) so the
    // controls don't flash a heavy halo.
    const FOCUS = 'focus-visible:!ring-0 focus-visible:!border-accent'

    // Square, flat, neutral icon buttons — same primitive/height/border as the
    // per-page MenuButton so the whole strip reads as one cohesive group.
    const navBtn = (icon: React.ReactNode, disabled: boolean, onClick: () => void, title: string) => (
        <Button variant="outline" size="sm" disabled={disabled} onClick={onClick} icon={icon} className={`w-7 !px-0 ${FOCUS}`} aria-label={title} title={title} />
    )

    // Chevrons centred in the 24×24 viewBox (centre x=12) so the rotated left
    // pair lines up identically with the right pair.
    const chevronRight = (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
        </svg>
    )

    const doubleChevronRight = (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l6 6-6 6M12 6l6 6-6 6" />
        </svg>
    )

    return (
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3">
            {options.withPicker !== false && (
                <div className="mr-auto flex items-center gap-2">
                    <span className="whitespace-nowrap text-xs text-foreground-muted">Rows per page</span>
                    <MenuButton
                        variant="outline"
                        size="sm"
                        side="top"
                        className={FOCUS}
                        label={String(currentPerPageLabel)}
                        items={picker.map((o) => ({
                            key: o.key,
                            label: String(o.label ?? o.value ?? o.key),
                            onSelect: () => {
                                if (!serverSide) setPerPageKey(o.key)
                                onPerPageChange(o.label ?? o.value ?? o.key)
                            },
                        }))}
                    />
                </div>
            )}
            <div className="flex items-center gap-1">
                {navBtn(<span className="inline-flex rotate-180">{doubleChevronRight}</span>, activePage === 0, () => onPageChange(0), 'First page')}
                {navBtn(<span className="inline-flex rotate-180">{chevronRight}</span>, activePage === 0, () => activePage > 0 && onPageChange(activePage - 1), 'Previous page')}
                <span className="px-2 text-xs tabular-nums text-foreground-secondary select-none">
                    {activePage + 1} <span className="text-foreground-muted">/ {maxPage + 1}</span>
                </span>
                {navBtn(chevronRight, activePage === maxPage, () => activePage < maxPage && onPageChange(activePage + 1), 'Next page')}
                {navBtn(doubleChevronRight, activePage === maxPage, () => onPageChange(maxPage), 'Last page')}
            </div>
        </div>
    )
}

/** ─────────────────── main component ─────────────────── */

/**
 * Data table with optional search, pagination, and expandable rows.
 *
 * - **Typed rows**: pass a generic `T` for full type inference on columns
 *   and cell renderers (`<Table<Vessel> ... />`).
 * - **Real `<table>` semantics**: keeps row / col / cell context intact for
 *   screen readers and lets the browser handle column sizing natively.
 *   Per-column widths via `column.width`.
 * - **Search**: client-side filter across ALL row values; result is
 *   memoized so each keystroke costs O(n) once per term change, not per
 *   render. Set `pagination.serverSide` to skip client-side filter and
 *   pagination entirely.
 * - **Expand**: each row gets a real `<button>` with `aria-expanded`.
 *   Expand state is keyed by `getRowKey(row, i)` so it survives reorders.
 *
 * @example Static, fully typed
 * ```tsx
 * type Vessel = { id: number; name: string; status: string }
 * <Table<Vessel>
 *   columns={[
 *     { key: 'name', label: 'Name', keyBind: 'name' },
 *     { key: 'status', label: 'Status', keyBind: 'status', width: 120 },
 *   ]}
 *   rows={vessels}
 *   getRowKey={(row) => row.id}
 * />
 * ```
 *
 * @example Server-side pagination
 * ```tsx
 * <Table
 *   columns={cols}
 *   rows={pageRows}
 *   pagination={{
 *     enabled: true, serverSide: true, perPage: 20,
 *     page: currentPage, totalCount, onPageChange, onPerPageChange,
 *   }}
 * />
 * ```
 */
export default function Table<T extends Record<string, any> = Record<string, any>>({
    columns = [],
    rows = [],
    getRowKey = defaultGetRowKey,
    pagination = DEFAULT_PAGINATION,
    expandRow = DEFAULT_EXPAND as ExpandRowOptions<T>,
    hasSearch = true,
    search,
    defaultSort = null,
    onSortChange,
    onCellEdit,
    footer = null,
    header = null,
    loading = false,
    loadingRowCount = 8,
    className = '',
    style,
}: TableProps<T>) {
    const searchRef = useRef<HTMLInputElement>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [perPage, setPerPage] = useState(
        typeof pagination.perPage === 'number' ? pagination.perPage : 15
    )
    const [activePage, setActivePage] = useState(0)
    const [sortState, setSortState] = useState<SortState | null>(defaultSort)

    const isServerSide = !!(pagination.enabled && pagination.serverSide)

    // Cycle a column's sort: none → asc → desc → none. Emits onSortChange so
    // server-side consumers can refetch; client-side sorting happens below.
    const handleSort = (col: TableColumn<T>) => {
        const key = col.keyBind
        let next: SortState | null
        if (!sortState || sortState.key !== key) next = { key, direction: 'asc' }
        else if (sortState.direction === 'asc') next = { key, direction: 'desc' }
        else next = null
        setSortState(next)
        onSortChange?.(next)
    }

    // Optional debounce for the search term (eases very large client lists).
    const debounceMs = search?.debounceMs ?? 0
    const [debouncedTerm, setDebouncedTerm] = useState('')
    useEffect(() => {
        if (debounceMs <= 0) { setDebouncedTerm(searchTerm); return }
        const t = setTimeout(() => setDebouncedTerm(searchTerm), debounceMs)
        return () => clearTimeout(t)
    }, [searchTerm, debounceMs])
    const term = debounceMs > 0 ? debouncedTerm : searchTerm

    // Client-side filter — memoised so the scan runs once per term change, not
    // per render. Server-side short-circuits (the consumer's API is the filter).
    const filteredRows = useMemo(() => {
        if (isServerSide || !term) return rows
        if (search?.predicate) return rows.filter((row) => search.predicate!(row, term))
        const cs = !!search?.caseSensitive
        const needle = cs ? term : term.toLowerCase()
        const mode = search?.matchMode ?? 'contains'
        const keys = search?.keys
        const test = (raw: unknown) => {
            if (raw == null) return false
            const s = cs ? String(raw) : String(raw).toLowerCase()
            return mode === 'startsWith' ? s.startsWith(needle) : mode === 'equals' ? s === needle : s.includes(needle)
        }
        return rows.filter((row) => (keys ? keys.some((k) => test(row[k])) : Object.values(row).some(test)))
    }, [rows, term, isServerSide, search?.predicate, search?.caseSensitive, search?.matchMode, search?.keys])

    // Sorted view of the filtered rows (client-side). Server-side sorting is
    // delegated to the consumer via onSortChange — the page data is untouched.
    const sortedRows = useMemo(() => {
        if (isServerSide || !sortState) return filteredRows
        const col = columns.find((c) => c.keyBind === sortState.key)
        const accessor = col?.sortAccessor ?? ((r: T) => r[sortState.key])
        const out = [...filteredRows].sort((a, b) => compareValues(accessor(a), accessor(b)))
        if (sortState.direction === 'desc') out.reverse()
        return out
    }, [filteredRows, sortState, isServerSide, columns])

    // Pagination buckets — derived. Re-bucketed when the sorted set or page size changes.
    const datasets = useMemo(() => {
        if (isServerSide) return [rows]
        return createDatasets(sortedRows, pagination.enabled ? perPage : null)
    }, [sortedRows, perPage, pagination.enabled, isServerSide, rows])

    const MAX_PAGE = useMemo(() => {
        if (isServerSide && typeof pagination.maxPage === 'number') return Math.max(0, pagination.maxPage)
        if (isServerSide && typeof pagination.totalCount === 'number')
            return Math.max(0, Math.ceil(pagination.totalCount / perPage) - 1)
        return datasets.length ? datasets.length - 1 : 0
    }, [isServerSide, pagination.maxPage, pagination.totalCount, perPage, datasets.length])

    const currentPageRows = useMemo(() => {
        if (isServerSide) return rows
        return datasets[activePage] ?? []
    }, [isServerSide, rows, datasets, activePage])

    // Sync per-page state with pagination prop when not server-side
    useEffect(() => {
        if (pagination.enabled && !isServerSide && typeof pagination.perPage === 'number') {
            setPerPage(pagination.perPage)
        }
    }, [pagination.enabled, pagination.perPage, isServerSide])

    // Server-side: mirror the per-page from props
    useEffect(() => {
        if (isServerSide && typeof pagination.perPage === 'number') setPerPage(pagination.perPage)
    }, [isServerSide, pagination.perPage])

    // Server-side: mirror the 1-based page from props
    useEffect(() => {
        if (isServerSide && typeof pagination.page === 'number' && pagination.page >= 1)
            setActivePage(pagination.page - 1)
    }, [isServerSide, pagination.page])

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        // Reset to the first page so the user sees the top of the filtered set.
        setActivePage(0)
    }

    const onPaginationChange = (perPageValue: number) => {
        setPerPage(perPageValue)
        setActivePage(0)
        if (isServerSide) pagination.onPerPageChange?.(perPageValue)
    }

    const handlePageChange = (newPage: number) => {
        if (isServerSide) {
            pagination.onPageChange?.(newPage + 1)
            return
        }
        setActivePage(newPage)
    }

    const pagPos = pagination.position ?? 'top'
    const showTopPager = !!pagination.enabled && (pagPos === 'top' || pagPos === 'both')
    const showBottomPager = !!pagination.enabled && (pagPos === 'bottom' || pagPos === 'both')
    const pager = (
        <Pagination
            activePage={activePage}
            onPageChange={handlePageChange}
            maxPage={MAX_PAGE}
            onPerPageChange={onPaginationChange}
            options={pagination}
            serverSide={isServerSide}
        />
    )

    return (
        <div className={`w-full h-max rounded-lg ${className}`.trim()} style={style}>
            {(hasSearch || showTopPager) && (
                <div className="flex items-center justify-between gap-3 mb-2">
                    {hasSearch ? (
                        <SearchInput
                            ref={searchRef}
                            value={searchTerm}
                            onChange={onSearchChange}
                            placeholder={search?.placeholder ?? 'Search term...'}
                        />
                    ) : (
                        <span />
                    )}
                    {showTopPager && pager}
                </div>
            )}
            <div>{header}</div>
            {/* Horizontal scroll wrapper — enables swipe-scroll on narrow viewports
                without forcing the table itself to layout horizontally. */}
            <div className="overflow-x-auto rounded-lg">
                <table className="w-full border-collapse" aria-busy={loading || undefined}>
                    <TableHeader columns={columns} hasExpand={!!expandRow.enabled} sort={sortState} onSort={handleSort} />
                    {loading ? (
                        <TableSkeletonBody
                            columns={columns}
                            rowCount={loadingRowCount}
                            hasExpand={!!expandRow.enabled}
                        />
                    ) : (
                        <TableBody
                            columns={columns}
                            rows={currentPageRows}
                            expandRow={expandRow}
                            getRowKey={getRowKey}
                            onCellEdit={onCellEdit}
                        />
                    )}
                </table>
            </div>
            {showBottomPager && <div className="mt-2 flex justify-end">{pager}</div>}
            <div>{footer}</div>
        </div>
    )
}

// ── Skeleton body ───────────────────────────────────────────────────────────
// Renders `rowCount` placeholder rows matching the column count. Used by the
// Table's `loading` prop during initial fetch or server-side pagination
// transitions.

function TableSkeletonBody<T extends Record<string, any>>({
    columns,
    rowCount,
    hasExpand,
}: {
    columns: TableColumn<T>[]
    rowCount: number
    hasExpand: boolean
}) {
    return (
        <tbody aria-hidden="true">
            {Array.from({ length: rowCount }).map((_, i) => (
                <tr
                    key={i}
                    className={`border-b border-border ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-raised'}`}
                >
                    {hasExpand && <td className="p-0 align-middle w-9" />}
                    {columns.map((col) => (
                        <td key={col.key} className="py-3 px-3 align-middle">
                            <SkeletonBox height={12} width={`${50 + (i % 4) * 12}%`} />
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    )
}
