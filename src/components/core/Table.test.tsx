import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

    // ── Semantic table markup ─────────────────────────────────────────────
    // Real `<thead>` / `<tbody>` / `<th scope="col">` give screen readers row /
    // column context. Earlier versions used `display: flex` on these elements
    // which strips that semantic meaning.

    it('uses real <th scope="col"> for column headers', () => {
        render(<Table columns={COLUMNS} rows={ROWS} />)
        const headers = screen.getAllByRole('columnheader')
        expect(headers).toHaveLength(COLUMNS.length)
        headers.forEach((h) => expect(h).toHaveAttribute('scope', 'col'))
    })

    it('renders one <tr> per row in <tbody>', () => {
        const { container } = render(
            <Table columns={COLUMNS} rows={ROWS} pagination={{ enabled: false }} />
        )
        const bodyRows = container.querySelectorAll('tbody > tr')
        expect(bodyRows).toHaveLength(ROWS.length)
    })

    // ── Generic typing ─────────────────────────────────────────────────────
    // Compile-time check: `Table<User>` constrains `keyBind` to keys of User.
    // If this file ever stops compiling under strict TypeScript, the generic
    // contract has regressed.

    it('infers cell value types from the row generic', () => {
        type Vessel = { id: number; name: string; status: 'At Sea' | 'In Port' }
        const cols: TableColumn<Vessel>[] = [
            { key: 'name',   label: 'Name',   keyBind: 'name'   },
            { key: 'status', label: 'Status', keyBind: 'status', width: 120, align: 'right' },
            {
                key: 'id',
                label: 'ID',
                keyBind: 'id',
                // `val` is inferred as Vessel[keyof Vessel] (number | string).
                // The component returning a string is valid ReactNode output.
                component: (val) => <code>#{String(val)}</code>,
            },
        ]
        const vessels: Vessel[] = [
            { id: 1, name: 'Aurora',  status: 'At Sea'  },
            { id: 2, name: 'Beacon',  status: 'In Port' },
        ]
        render(<Table<Vessel> columns={cols} rows={vessels} pagination={{ enabled: false }} />)
        expect(screen.getByText('Aurora')).toBeInTheDocument()
        expect(screen.getByText('#1')).toBeInTheDocument()
    })

    // ── getRowKey + expand-row state ──────────────────────────────────────
    // The custom row-key keeps expand state attached to the same logical row
    // even if `rows` is reordered or filtered.

    it('uses getRowKey for expand-row state tracking', () => {
        const expandComp = (row: { name: string }) => <span data-testid={`expanded-${row.name}`}>{row.name} details</span>
        render(
            <Table
                columns={COLUMNS}
                rows={ROWS}
                pagination={{ enabled: false }}
                getRowKey={(row) => (row as typeof ROWS[number]).key}
                expandRow={{ enabled: true, expandComponent: expandComp }}
            />
        )
        const expandButtons = screen.getAllByRole('button', { name: /expand row/i })
        expect(expandButtons).toHaveLength(ROWS.length)
        // Open the second row's expand
        fireEvent.click(expandButtons[1])
        expect(screen.getByTestId('expanded-Bob')).toBeInTheDocument()
        // First and third should not be expanded
        expect(screen.queryByTestId('expanded-Alice')).not.toBeInTheDocument()
        expect(screen.queryByTestId('expanded-Charlie')).not.toBeInTheDocument()
        // Button now reports aria-expanded=true
        expect(screen.getByRole('button', { name: /collapse row/i })).toBe(expandButtons[1])
    })
})
