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
}

export interface PaginationOptions {
    enabled?: boolean
    perPage?: number
    withPicker?: boolean
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
    expandIcon?: React.ReactNode
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
const DEFAULT_PICKER: PaginationOptions['pickerOptions'] = [
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

function TableHeader<T extends Record<string, any>>({
    columns,
    hasExpand,
}: {
    columns: TableColumn<T>[]
    hasExpand: boolean
}) {
    return (
        <thead className="bg-surface-raised border-b border-border">
            <tr>
                {hasExpand && <th aria-hidden="true" className="w-9" />}
                {columns.map((col) => (
                    <th
                        key={col.key}
                        scope="col"
                        className={`${cellAlign(col.align)} text-sm font-semibold text-foreground py-3 px-3`}
                        style={col.width != null ? { width: col.width } : undefined}
                    >
                        {col.label}
                    </th>
                ))}
            </tr>
        </thead>
    )
}

const DefaultExpandIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 text-foreground-muted"
        aria-hidden="true"
    >
        <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
            clipRule="evenodd"
        />
    </svg>
)

function TableBody<T extends Record<string, any>>({
    columns,
    rows,
    expandRow,
    getRowKey,
}: {
    columns: TableColumn<T>[]
    rows: T[]
    expandRow: ExpandRowOptions<T>
    getRowKey: (row: T, index: number) => React.Key
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
                                        className={`w-9 h-9 inline-flex items-center justify-center rounded-md hover:bg-surface/80 transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                            isExpanded ? 'rotate-180' : ''
                                        }`}
                                    >
                                        {expandRow.expandIcon ?? DefaultExpandIcon}
                                    </button>
                                </td>
                            )}
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={`${cellAlign(col.align)} text-sm text-foreground py-2 px-3 align-middle`}
                                >
                                    {col.component
                                        ? col.component(row[col.keyBind] as T[keyof T], row)
                                        : (row[col.keyBind] as React.ReactNode)}
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
    const navBtn = (icon: React.ReactNode, disabled: boolean, onClick: () => void, title: string) => (
        <Button variant="outline" size="sm" disabled={disabled} onClick={onClick} icon={icon} className="w-7 !px-0 focus-visible:!ring-[3px] focus-visible:!ring-focus-ring focus-visible:!ring-offset-0" aria-label={title} title={title} />
    )

    const chevronRight = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    )

    const doubleChevronRight = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
    )

    return (
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3">
            {options.withPicker && (
                <div className="mr-auto flex items-center gap-2">
                    <span className="whitespace-nowrap text-xs text-foreground-muted">Rows per page</span>
                    <MenuButton
                        variant="outline"
                        size="sm"
                        side="top"
                        className="focus-visible:!ring-[3px] focus-visible:!ring-focus-ring focus-visible:!ring-offset-0"
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
                <span className="px-2 text-sm tabular-nums text-foreground-secondary select-none">
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

    const isServerSide = !!(pagination.enabled && pagination.serverSide)

    // Filter is derived state — memoized so each keystroke only runs the
    // O(n × columns) scan once per `searchTerm` change, not on every render.
    // Server-side mode short-circuits: the consumer's API is the filter.
    const filteredRows = useMemo(() => {
        if (isServerSide || !searchTerm) return rows
        const term = searchTerm.toLowerCase()
        return rows.filter((row) =>
            Object.values(row).some(
                (v) => v != null && String(v).toLowerCase().includes(term)
            )
        )
    }, [rows, searchTerm, isServerSide])

    // Pagination buckets — also derived. Re-bucketed whenever the filtered
    // set OR page size changes.
    const datasets = useMemo(() => {
        if (isServerSide) return [rows]
        return createDatasets(filteredRows, pagination.enabled ? perPage : null)
    }, [filteredRows, perPage, pagination.enabled, isServerSide, rows])

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

    return (
        <div className={`w-full h-max rounded-lg ${className}`.trim()} style={style}>
            <div className="flex items-center justify-between mb-2">
                {hasSearch && (
                    <SearchInput
                        ref={searchRef}
                        value={searchTerm}
                        onChange={onSearchChange}
                        placeholder="Search term..."
                    />
                )}
                {pagination.enabled && (
                    <Pagination
                        activePage={activePage}
                        onPageChange={handlePageChange}
                        maxPage={MAX_PAGE}
                        onPerPageChange={onPaginationChange}
                        options={pagination}
                        serverSide={isServerSide}
                    />
                )}
            </div>
            <div>{header}</div>
            {/* Horizontal scroll wrapper — enables swipe-scroll on narrow viewports
                without forcing the table itself to layout horizontally. */}
            <div className="overflow-x-auto rounded-lg">
                <table className="w-full border-collapse" aria-busy={loading || undefined}>
                    <TableHeader columns={columns} hasExpand={!!expandRow.enabled} />
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
                        />
                    )}
                </table>
            </div>
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
