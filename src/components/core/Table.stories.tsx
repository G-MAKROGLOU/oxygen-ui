import React, { useCallback, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { http, HttpResponse, delay } from 'msw'
import Table from './Table'
import type { TableColumn, PaginationOptions } from './Table'

const meta: Meta<typeof Table> = {
    title: 'Core/Table',
    component: Table,
    parameters: { layout: 'padded' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Table>

/** ── Shared fixtures ───────────────────────────────────────────── */

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
}))

/** ── Static stories ────────────────────────────────────────────── */

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

/** ── MSW-powered story ─────────────────────────────────────────── */
//
// This story demonstrates how to integrate your own API with the Table
// server-side pagination feature. MSW intercepts GET /api/vessels so the
// story works offline with realistic async behaviour.
//
// Consumers: replicate this pattern in your app's stories, replacing the
// mock handler with your real endpoint URL.

interface VesselsResponse {
    rows:       typeof ALL_ROWS
    totalCount: number
    page:       number
    perPage:    number
}

const PER_PAGE = 10

function AsyncServerSideTable() {
    const [rows,       setRows]       = useState<typeof ALL_ROWS>([])
    const [page,       setPage]       = useState(1)
    const [perPage,    setPerPage]    = useState(PER_PAGE)
    const [totalCount, setTotalCount] = useState(0)
    const [loading,    setLoading]    = useState(false)

    // Fetch when page or perPage changes
    const fetchPage = useCallback(async (p: number, pp: number) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/vessels?page=${p}&perPage=${pp}`)
            const data: VesselsResponse = await res.json()
            setRows(data.rows)
            setTotalCount(data.totalCount)
            setPage(data.page)
            setPerPage(data.perPage)
        } finally {
            setLoading(false)
        }
    }, [])

    // Load first page on mount
    React.useEffect(() => { fetchPage(1, PER_PAGE) }, [fetchPage])

    const pagination: PaginationOptions = {
        enabled:      true,
        serverSide:   true,
        page,
        perPage,
        totalCount,
        withPicker:   true,
        onPageChange:       (p)  => fetchPage(p, perPage),
        onPerPageChange:    (pp) => fetchPage(1, pp),
    }

    return (
        <div style={{ position: 'relative' }}>
            {loading && (
                <div
                    style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(255,255,255,.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 10, borderRadius: 8,
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 24, height: 24 }} className="animate-spin text-accent">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" />
                    </svg>
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
                story: [
                    'Server-side pagination with MSW mocking `GET /api/vessels`.',
                    'The 400 ms simulated delay makes the loading overlay visible.',
                    '',
                    '**In your app:** replace the MSW handler with your real endpoint.',
                    'The component pattern (fetch on page/perPage change) is the same.',
                ].join('\n'),
            },
        },
        msw: {
            handlers: [
                http.get('/api/vessels', async ({ request }) => {
                    const url      = new URL(request.url)
                    const page     = Number(url.searchParams.get('page'))   || 1
                    const perPage  = Number(url.searchParams.get('perPage')) || PER_PAGE
                    const start    = (page - 1) * perPage
                    const rows     = ALL_ROWS.slice(start, start + perPage)

                    // Simulate network latency so the loading overlay is visible
                    await delay(400)

                    return HttpResponse.json({
                        rows,
                        totalCount: ALL_ROWS.length,
                        page,
                        perPage,
                    } satisfies VesselsResponse)
                }),
            ],
        },
    },
}
