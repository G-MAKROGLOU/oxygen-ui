import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import Table, { TableColumn } from './Table'

const COLUMNS: TableColumn[] = [
    { key: 'name',   label: 'Name',   keyBind: 'name'   },
    { key: 'role',   label: 'Role',   keyBind: 'role'   },
    { key: 'status', label: 'Status', keyBind: 'status' },
]

const ROWS = [
    { key: 'r1', name: 'Alice',   role: 'Admin',  status: 'Active'   },
    { key: 'r2', name: 'Bob',     role: 'Editor', status: 'Inactive' },
    { key: 'r3', name: 'Charlie', role: 'Viewer', status: 'Active'   },
]

describe('Table', () => {
    // ── Column headers ─────────────────────────────────────────────────────

    it('renders all column headers', () => {
        render(<Table columns={COLUMNS} rows={ROWS} />)
        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Role')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
    })

    // ── Row data ───────────────────────────────────────────────────────────

    it('renders cell values', () => {
        render(<Table columns={COLUMNS} rows={ROWS} pagination={{ enabled: false }} />)
        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.getByText('Bob')).toBeInTheDocument()
        expect(screen.getByText('Charlie')).toBeInTheDocument()
    })

    it('renders empty table without crashing', () => {
        render(<Table columns={COLUMNS} rows={[]} />)
        expect(screen.getByText('Name')).toBeInTheDocument()
    })

    // ── Search ─────────────────────────────────────────────────────────────

    it('renders search input by default', () => {
        render(<Table columns={COLUMNS} rows={ROWS} />)
        expect(screen.getByPlaceholderText('Search term...')).toBeInTheDocument()
    })

    it('hides search input when hasSearch=false', () => {
        render(<Table columns={COLUMNS} rows={ROWS} hasSearch={false} />)
        expect(screen.queryByPlaceholderText('Search term...')).not.toBeInTheDocument()
    })

    it('filters rows when search term is typed', () => {
        render(
            <Table
                columns={COLUMNS}
                rows={ROWS}
                pagination={{ enabled: false }}
            />
        )
        fireEvent.change(screen.getByPlaceholderText('Search term...'), {
            target: { value: 'alice' },
        })
        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.queryByText('Bob')).not.toBeInTheDocument()
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument()
    })

    // ── Custom cell renderer ───────────────────────────────────────────────

    it('renders custom cell component', () => {
        const columns: TableColumn[] = [
            ...COLUMNS.slice(0, 2),
            {
                key: 'badge',
                label: 'Status',
                keyBind: 'status',
                component: (val) => <span data-testid="badge">{val}</span>,
            },
        ]
        render(<Table columns={columns} rows={ROWS} pagination={{ enabled: false }} />)
        const badges = screen.getAllByTestId('badge')
        expect(badges).toHaveLength(ROWS.length)
        expect(badges[0]).toHaveTextContent('Active')
    })

    // ── Header / footer slots ──────────────────────────────────────────────

    it('renders header slot', () => {
        render(
            <Table
                columns={COLUMNS}
                rows={ROWS}
                header={<div data-testid="tbl-header">Table Header</div>}
            />
        )
        expect(screen.getByTestId('tbl-header')).toBeInTheDocument()
    })

    it('renders footer slot', () => {
        render(
            <Table
                columns={COLUMNS}
                rows={ROWS}
                footer={<div data-testid="tbl-footer">Table Footer</div>}
            />
        )
        expect(screen.getByTestId('tbl-footer')).toBeInTheDocument()
    })

    // ── Scroll wrapper ─────────────────────────────────────────────────────

    it('wraps table in an overflow-x-auto container', () => {
        const { container } = render(<Table columns={COLUMNS} rows={ROWS} />)
        const wrapper = container.querySelector('.overflow-x-auto')
        expect(wrapper).toBeInTheDocument()
        expect(wrapper?.querySelector('table')).toBeInTheDocument()
    })
})
