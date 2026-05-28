import React, { useCallback, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse, delay } from 'msw'
import Table from './Table'
import type { TableColumn, PaginationOptions } from './Table'

const meta: Meta<typeof Table> = {
    title: 'Data Display/Table',
    component: Table,
    parameters: { layout: 'padded' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Table>

/** ── Shared fixtures ──────────────────────────────────────────────────────── */

const COLUMNS: TableColumn[] = [
    { key: 'id',     label: 'ID',     keyBind: 'id' },
    { key: 'name',   label: 'Name',   keyBind: 'name' },
    { key: 'status', label: 'Status', keyBind: 'status' },
    { key: 'port',   label: 'Port',   keyBind: 'port' },
]

const ALL_ROWS = Array.from({ length: 100 }, (_, i) => ({
    key:    `row-${i + 1}`,
    id:     i + 1,
    name:   `Vessel ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) || ''}`,
    status: i % 3 === 0 ? 'At Sea' : i % 3 === 1 ? 'In Port' : 'Anchored',
    port:   ['Piraeus', 'Rotterdam', 'Singapore', 'Houston'][i % 4],
    imo:    `IMO${9000000 + i}`,
    flag:   ['GR', 'NL', 'SG', 'US'][i % 4],
    dwt:    10000 + i * 500,
}))

/** ── Static stories ──────────────────────────────────────────────────────── */

export const Default: Story = {
    args: {
        columns:    COLUMNS,
        rows:       ALL_ROWS.slice(0, 32),
        pagination: { enabled: true, perPage: 10, withPicker: true },
    },
}

export const NoPagination: Story = {
    args: {
        columns:    COLUMNS,
        rows:       ALL_ROWS.slice(0, 5),
        pagination: { enabled: false },
        hasSearch:  false,
    },
}

/** ── Expandable rows ─────────────────────────────────────────────────────── */

function VesselDetail({ row }: { row: typeof ALL_ROWS[0] }) {
    return (
        <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-surface-raised text-sm">
            <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wide mb-0.5">IMO Number</p>
                <p className="text-foreground font-medium">{row.imo}</p>
            </div>
            <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wide mb-0.5">Flag</p>
                <p className="text-foreground font-medium">{row.flag}</p>
            </div>
            <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wide mb-0.5">DWT</p>
                <p className="text-foreground font-medium">{row.dwt.toLocaleString()} t</p>
            </div>
        </div>
    )
}

export const ExpandableRows: Story = {
    args: {
        columns:   COLUMNS,
        rows:      ALL_ROWS.slice(0, 8),
        pagination: { enabled: false },
        hasSearch: false,
        expandRow: {
            enabled: true,
            expandComponent: (row) => <VesselDetail row={row} />,
        },
    },
}

export const ExpandableWithPagination: Story = {
    args: {
        columns:   COLUMNS,
        rows:      ALL_ROWS.slice(0, 30),
        pagination: { enabled: true, perPage: 10, withPicker: true },
        expandRow: {
            enabled: true,
            expandComponent: (row) => <VesselDetail row={row} />,
        },
    },
}

/** ── Server-side (static) ────────────────────────────────────────────────── */

export const ServerSide: Story = {
    args: {
        columns: COLUMNS,
        rows:    ALL_ROWS.slice(0, 10),
        pagination: {
            enabled:    true,
            serverSide: true,
            page:       1,
            totalCount: 100,
            perPage:    10,
            withPicker: true,
            onPageChange:    (p) => console.log('page:', p),
            onPerPageChange: (pp) => console.log('perPage:', pp),
        },
    },
}

/** ── MSW-powered async story ────────────────────────────────────────────── */
//
// MSW intercepts GET /api/vessels with a 400 ms simulated delay.
// The component manages its own loading state and re-fetches on page/perPage change.
//
// If toasts appear saying "Failed to fetch" the MSW service worker may not
// have registered yet — reload the Storybook page once and try again.

const PER_PAGE_DEFAULT = 10

function AsyncServerSideTable() {
    const [rows,       setRows]       = useState<typeof ALL_ROWS>([])
    const [page,       setPage]       = useState(1)
    const [perPage,    setPerPage]    = useState(PER_PAGE_DEFAULT)
    const [totalCount, setTotalCount] = useState(0)
    const [loading,    setLoading]    = useState(false)
    const [error,      setError]      = useState<string | null>(null)

    const fetchPage = useCallback(async (p: number, pp: number) => {
        setLoading(true)
        setError(null)
        try {
            const res  = await fetch(`/api/vessels?page=${p}&perPage=${pp}`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            setRows(data.rows)
            setTotalCount(data.totalCount)
            setPage(data.page)
            setPerPage(data.perPage)
        } catch (e: any) {
            setError(e.message ?? 'Failed to load')
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => { fetchPage(1, PER_PAGE_DEFAULT) }, [fetchPage])

    const pagination: PaginationOptions = {
        enabled:         true,
        serverSide:      true,
        page,
        perPage,
        totalCount,
        withPicker:      true,
        onPageChange:    (p)  => fetchPage(p, perPage),
        onPerPageChange: (pp) => fetchPage(1, pp),
    }

    return (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/70 rounded-lg backdrop-blur-[1px]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 animate-spin text-accent">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" />
                    </svg>
                </div>
            )}
            {error && (
                <div className="mb-2 rounded-md bg-status-error/10 border border-status-error/20 px-3 py-2 text-sm text-status-error">
                    {error} — MSW service worker may not be active yet. Reload once.
                </div>
            )}
            <Table columns={COLUMNS} rows={rows} pagination={pagination} />
        </div>
    )
}

export const AsyncServerSide: Story = {
    render: () => <AsyncServerSideTable />,
    parameters: {
        docs: {
            description: {
                story: 'Server-side pagination with `GET /api/vessels` mocked by MSW (400 ms latency). If you see a fetch error, reload — the service worker registers asynchronously on first load.',
            },
        },
        msw: {
            handlers: [
                http.get('/api/vessels', async ({ request }) => {
                    const url     = new URL(request.url)
                    const page    = Number(url.searchParams.get('page'))    || 1
                    const pp      = Number(url.searchParams.get('perPage')) || PER_PAGE_DEFAULT
                    const start   = (page - 1) * pp
                    await delay(400)
                    return HttpResponse.json({
                        rows:       ALL_ROWS.slice(start, start + pp),
                        totalCount: ALL_ROWS.length,
                        page,
                        perPage:    pp,
                    })
                }),
            ],
        },
    },
}
