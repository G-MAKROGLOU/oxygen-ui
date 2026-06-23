import React from 'react'
import ReactDOM from 'react-dom'
import { describe, it, expect, vi } from 'vitest'
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

    // ── Sorting ────────────────────────────────────────────────────────────

    const SORT_ROWS = [
        { key: 'r1', name: 'Charlie', role: 'Viewer', status: 'Active' },
        { key: 'r2', name: 'Alice', role: 'Admin', status: 'Active' },
        { key: 'r3', name: 'Bob', role: 'Editor', status: 'Inactive' },
    ]
    const SORTABLE: TableColumn[] = [{ key: 'name', label: 'Name', keyBind: 'name', sortable: true }, ...COLUMNS.slice(1)]
    const bodyOrder = (container: HTMLElement) =>
        Array.from(container.querySelectorAll('tbody > tr td:first-child')).map((td) => td.textContent)

    it('sorts ascending then descending then clears on header click', () => {
        const onSortChange = vi.fn()
        const { container } = render(
            <Table columns={SORTABLE} rows={SORT_ROWS} pagination={{ enabled: false }} onSortChange={onSortChange} />,
        )
        const header = screen.getByRole('button', { name: /Name/ })
        fireEvent.click(header) // asc
        expect(bodyOrder(container)).toEqual(['Alice', 'Bob', 'Charlie'])
        expect(onSortChange).toHaveBeenLastCalledWith({ key: 'name', direction: 'asc' })
        fireEvent.click(header) // desc
        expect(bodyOrder(container)).toEqual(['Charlie', 'Bob', 'Alice'])
        expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending')
        fireEvent.click(header) // cleared → original order
        expect(bodyOrder(container)).toEqual(['Charlie', 'Alice', 'Bob'])
        expect(onSortChange).toHaveBeenLastCalledWith(null)
    })

    it('respects defaultSort', () => {
        const { container } = render(
            <Table columns={SORTABLE} rows={SORT_ROWS} pagination={{ enabled: false }} defaultSort={{ key: 'name', direction: 'asc' }} />,
        )
        expect(bodyOrder(container)).toEqual(['Alice', 'Bob', 'Charlie'])
    })

    // ── Editable cells ─────────────────────────────────────────────────────

    it('edits a cell and fires onCellEdit on Enter', () => {
        const onCellEdit = vi.fn()
        const cols: TableColumn[] = [{ key: 'name', label: 'Name', keyBind: 'name', editable: true }, ...COLUMNS.slice(1)]
        render(<Table columns={cols} rows={ROWS} pagination={{ enabled: false }} onCellEdit={onCellEdit} />)
        fireEvent.click(screen.getByRole('button', { name: 'Alice' }))
        const input = screen.getByRole('textbox') as HTMLInputElement
        fireEvent.change(input, { target: { value: 'Alicia' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ key: 'name', value: 'Alicia', rowIndex: 0 }))
    })

    // ── Custom editor dismissal (col.editor) ───────────────────────────────
    const editorCols = (): TableColumn[] => [
        {
            key: 'name', label: 'Name', keyBind: 'name', editable: true,
            editor: ({ value }) => <div data-testid="custom-editor">editing {String(value)}</div>,
        },
        ...COLUMNS.slice(1),
    ]

    it('opens a custom editor and dismisses it on outside click', () => {
        render(<Table columns={editorCols()} rows={ROWS} pagination={{ enabled: false }} onCellEdit={vi.fn()} />)
        fireEvent.click(screen.getByRole('button', { name: 'Alice' }))
        expect(screen.getByTestId('custom-editor')).toBeInTheDocument()
        fireEvent.mouseDown(document.body)
        expect(screen.queryByTestId('custom-editor')).not.toBeInTheDocument()
    })

    it('dismisses a custom editor on Escape', () => {
        render(<Table columns={editorCols()} rows={ROWS} pagination={{ enabled: false }} onCellEdit={vi.fn()} />)
        fireEvent.click(screen.getByRole('button', { name: 'Alice' }))
        expect(screen.getByTestId('custom-editor')).toBeInTheDocument()
        fireEvent.keyDown(document, { key: 'Escape' })
        expect(screen.queryByTestId('custom-editor')).not.toBeInTheDocument()
    })

    it('keeps a custom editor open when clicking inside its portaled popup', () => {
        const cols: TableColumn[] = [
            {
                key: 'name', label: 'Name', keyBind: 'name', editable: true,
                editor: () => (
                    <div data-testid="custom-editor">
                        {ReactDOM.createPortal(
                            <div data-radix-popper-content-wrapper="">
                                <button data-testid="popup-option">option</button>
                            </div>,
                            document.body,
                        )}
                    </div>
                ),
            },
            ...COLUMNS.slice(1),
        ]
        render(<Table columns={cols} rows={ROWS} pagination={{ enabled: false }} onCellEdit={vi.fn()} />)
        fireEvent.click(screen.getByRole('button', { name: 'Alice' }))
        expect(screen.getByTestId('custom-editor')).toBeInTheDocument()
        // Click inside the portaled popup — must NOT cancel the edit.
        fireEvent.mouseDown(screen.getByTestId('popup-option'))
        expect(screen.getByTestId('custom-editor')).toBeInTheDocument()
    })

    // ── Search options ─────────────────────────────────────────────────────

    it('restricts search to the configured keys', () => {
        render(<Table columns={COLUMNS} rows={ROWS} pagination={{ enabled: false }} search={{ keys: ['name'] }} />)
        // 'Admin' is a role value; with keys=['name'] it should match nothing
        fireEvent.change(screen.getByPlaceholderText('Search term...'), { target: { value: 'admin' } })
        expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    })

    it('supports startsWith match mode + custom placeholder', () => {
        render(<Table columns={COLUMNS} rows={ROWS} pagination={{ enabled: false }} search={{ matchMode: 'startsWith', placeholder: 'Find…' }} />)
        const input = screen.getByPlaceholderText('Find…')
        fireEvent.change(input, { target: { value: 'lic' } }) // 'lic' is inside 'Alice' but not a prefix
        expect(screen.queryByText('Alice')).not.toBeInTheDocument()
        fireEvent.change(input, { target: { value: 'ali' } })
        expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    // ── Pagination position ────────────────────────────────────────────────

    it('renders two pagers when position is "both"', () => {
        render(<Table columns={COLUMNS} rows={ROWS} pagination={{ enabled: true, position: 'both' }} />)
        expect(screen.getAllByLabelText('Next page')).toHaveLength(2)
    })

    it('renders the pager after the table when position is "bottom"', () => {
        const { container } = render(
            <Table columns={COLUMNS} rows={ROWS} hasSearch={false} pagination={{ enabled: true, position: 'bottom' }} />,
        )
        const table = container.querySelector('table')!
        const nextBtn = screen.getByLabelText('Next page')
        // bottom pager comes after the table in document order
        expect(table.compareDocumentPosition(nextBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
})
