import React, { useEffect, useMemo, useRef, useState } from 'react'
import SearchInput from '../inputs/SearchInput'
import Dropdown from '../inputs/Dropdown'
import IconButton from './IconButton'
import COLORS from '../../utils/colors'

/** ─────────────────── types ─────────────────── */
export interface TableColumn {
    key: string | number
    label: React.ReactNode
    keyBind: string
    component?: (cellValue: any, row: any) => React.ReactNode
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

export interface ExpandRowOptions {
    enabled?: boolean
    expandIcon?: React.ReactNode
    expandComponent?: (row: any) => React.ReactNode
}

export interface TableProps {
    columns?: TableColumn[]
    rows?: any[]
    pagination?: PaginationOptions
    expandRow?: ExpandRowOptions
    hasSearch?: boolean
    footer?: React.ReactNode
    header?: React.ReactNode
    tableRef?: React.Ref<any>
    [key: string]: any
}

/** ─────────────────── defaults ─────────────────── */
const DEFAULT_PICKER: PaginationOptions['pickerOptions'] = [
    { key: 1, value: 5, label: 5 },
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
    expandIcon: <></>,
    expandComponent: () => <></>,
}

/** ─────────────────── helpers ─────────────────── */
function createDatasets(rows: any[], perPage: number | null): any[][] {
    if (!perPage) return [rows.slice()]
    const all: any[][] = []
    for (let i = 0; i < rows.length; i += perPage) {
        all.push(rows.slice(i, i + perPage))
    }
    return all
}

/** ─────────────────── sub-components ─────────────────── */
function TableHeader({ columns }: { columns: TableColumn[] }) {
    return (
        <thead className="dark:bg-prussian-blue bg-ice-dark min-h-[50px] border-b border-b-white border-t-white dark:border-b-independence flex items-center">
            <tr className="flex w-full items-center justify-center">
                {columns.map((col) => (
                    <th
                        key={col.key}
                        className="text-center w-full text-[13px] text-prussian-blue dark:text-white"
                    >
                        {col.label}
                    </th>
                ))}
            </tr>
        </thead>
    )
}

function TableBody({
    columns,
    rows,
    expandRow,
}: {
    activePage?: number
    columns: TableColumn[]
    rows: any[]
    expandRow: ExpandRowOptions
}) {
    const [visibleRows, setVisibleRows] = useState<Record<string, { visible: boolean }>>({})

    const toggleRow = (rowKey: string) => {
        setVisibleRows((prev) => ({
            ...prev,
            [rowKey]: { visible: !prev[rowKey]?.visible },
        }))
    }

    useEffect(() => {
        if (rows.length && Object.keys(visibleRows).length === 0) {
            const initial: Record<string, { visible: boolean }> = {}
            rows.forEach((row) => {
                initial[row.key] = { visible: false }
            })
            setVisibleRows(initial)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows])

    return (
        <tbody className="w-full">
            {rows.map((row, i) => (
                <React.Fragment key={row.key}>
                    <tr
                        className={`border-b border-b-white dark:border-b-manatee flex min-w-max hover:bg-ice-dark dark:hover:bg-prussian-blue transition-all duration-150 ${
                            i % 2 === 0
                                ? 'bg-ice dark:bg-prussian-blue'
                                : 'bg-ice-dark dark:bg-black-coral'
                        }`}
                    >
                        {expandRow.enabled && (
                            <td className="flex items-center">
                                <span
                                    onClick={() => toggleRow(row.key)}
                                    className={`p-2 cursor-pointer origin-center transition-all duration-200 ${
                                        visibleRows[row.key]?.visible ? 'rotate-180' : 'rotate-0'
                                    }`}
                                >
                                    {expandRow.expandIcon ?? (
                                        /* PlusCircle */
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={COLORS.PALETTE['prussian-blue']} className="w-5 h-5 dark:fill-white">
                                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </span>
                            </td>
                        )}
                        {columns.map((col, index) => (
                            <td
                                key={index}
                                className={`text-center min-h-[40px] w-full flex items-center justify-center p-1 border-white dark:border-manatee ${
                                    index !== columns.length - 1 ? 'border-r-2' : ''
                                }`}
                            >
                                {'component' in col && col.component
                                    ? col.component(row[col.keyBind], row)
                                    : row[col.keyBind]}
                            </td>
                        ))}
                    </tr>

                    {expandRow.enabled && (
                        <tr
                            key={`extra-${i}`}
                            className={`overflow-hidden w-full transition-all duration-300 ${
                                visibleRows[row.key]?.visible ? 'max-h-[2000px]' : 'max-h-0'
                            }`}
                        >
                            <td colSpan={columns.length} className="p-0 pb-1">
                                <div
                                    className={`overflow-hidden w-full transition-[max-height] duration-300 ${
                                        visibleRows[row.key]?.visible ? 'max-h-[2000px]' : 'max-h-0'
                                    }`}
                                >
                                    {expandRow.expandComponent?.(row)}
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            ))}
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

    const navBtn = (icon: React.ReactNode, disabled: boolean, onClick: () => void) => (
        <IconButton disabled={disabled} onClick={onClick} icon={icon} />
    )

    const chevronRight = (color: string) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    )

    const doubleChevronRight = (color: string) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
    )

    const disabledColor = COLORS.PALETTE['prussian-blue']
    const enabledColor = COLORS.PALETTE.white

    return (
        <div className="flex gap-2 items-center justify-end pt-2">
            {navBtn(
                <span className="rotate-180 inline-flex">{doubleChevronRight(activePage === 0 ? disabledColor : enabledColor)}</span>,
                activePage === 0,
                () => onPageChange(0)
            )}
            {navBtn(
                <span className="rotate-180 inline-flex">{chevronRight(activePage === 0 ? disabledColor : enabledColor)}</span>,
                activePage === 0,
                () => activePage > 0 && onPageChange(activePage - 1)
            )}
            <span className="bg-ice-dark dark:bg-independence rounded-lg ml-2 mr-2 shadow-md p-2 w-10 text-center select-none">
                {activePage + 1}
            </span>
            {navBtn(
                chevronRight(activePage === maxPage ? disabledColor : enabledColor),
                activePage === maxPage,
                () => activePage < maxPage && onPageChange(activePage + 1)
            )}
            {navBtn(
                doubleChevronRight(activePage === maxPage ? disabledColor : enabledColor),
                activePage === maxPage,
                () => onPageChange(maxPage)
            )}
            {options.withPicker && (
                <Dropdown
                    style={{ width: 80, position: 'relative', bottom: 4 }}
                    hasSearch={false}
                    items={picker}
                    isMultiselect={false}
                    value={displayPerPageKey}
                    onChange={({ target: { value } }) => {
                        const key = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value
                        if (!serverSide) setPerPageKey(key)
                        const opt = picker.find((o) => o.key === key)
                        onPerPageChange(opt?.label ?? opt?.value ?? key)
                    }}
                />
            )}
        </div>
    )
}

/** ─────────────────── main component ─────────────────── */

/**
 * Data table with optional search, pagination, and expandable rows.
 *
 * Supports both client-side and server-side pagination.
 *
 * @example
 * <Table
 *   columns={[{ key: 'name', label: 'Name', keyBind: 'name' }]}
 *   rows={data}
 *   pagination={{ enabled: true, perPage: 15 }}
 * />
 */
export default function Table({
    columns = [],
    rows = [],
    pagination = DEFAULT_PAGINATION,
    expandRow = DEFAULT_EXPAND,
    hasSearch = true,
    footer = null,
    header = null,
}: TableProps) {
    const searchRef = useRef<HTMLInputElement>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [perPage, setPerPage] = useState(
        typeof pagination.perPage === 'number' ? pagination.perPage : 15
    )
    const [activePage, setActivePage] = useState(0)
    const [datasets, setDatasets] = useState<any[][]>([])

    const isServerSide = !!(pagination.enabled && pagination.serverSide)

    const MAX_PAGE = useMemo(() => {
        if (isServerSide && typeof pagination.maxPage === 'number') return Math.max(0, pagination.maxPage)
        if (isServerSide && typeof pagination.totalCount === 'number')
            return Math.max(0, Math.ceil(pagination.totalCount / perPage) - 1)
        return datasets.length ? datasets.length - 1 : 0
    }, [isServerSide, pagination.maxPage, pagination.totalCount, perPage, datasets.length])

    const currentPageRows = useMemo(() => {
        if (isServerSide) return rows
        return datasets.length ? datasets[activePage] ?? [] : []
    }, [isServerSide, rows, datasets, activePage])

    useEffect(() => {
        if (pagination.enabled && !isServerSide) setPerPage(pagination.perPage ?? 15)
    }, [pagination, isServerSide])

    useEffect(() => {
        if (isServerSide && typeof pagination.perPage === 'number') setPerPage(pagination.perPage)
    }, [isServerSide, pagination.perPage])

    useEffect(() => {
        if (isServerSide) return
        setDatasets(createDatasets(rows, pagination.enabled ? perPage : null))
    }, [rows, perPage, pagination, isServerSide])

    useEffect(() => {
        if (isServerSide && typeof pagination.page === 'number' && pagination.page >= 1)
            setActivePage(pagination.page - 1)
    }, [isServerSide, pagination.page])

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value
        setSearchTerm(term)
        if (isServerSide) return
        const filtered = rows.filter((row) =>
            Object.values(row).some(
                (v) => !!v && String(v).toLowerCase().includes(term.toLowerCase())
            )
        )
        setDatasets(createDatasets(filtered, pagination.enabled ? perPage : null))
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
        <div className="w-full h-max rounded-lg">
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
            <table className="w-full h-full">
                <TableHeader columns={columns} />
                <TableBody columns={columns} rows={currentPageRows} expandRow={expandRow} />
            </table>
            <div>{footer}</div>
        </div>
    )
}
