import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DataGrid, { type GridColumn, type CellValue } from './DataGrid'

const columns: GridColumn[] = [
    { key: 'id', label: '#', width: 80 },
    { key: 'name', label: 'Name', width: 160, editable: false },
    { key: 'score', label: 'Score', width: 100, editable: true },
]

const makeRows = (n: number): Array<Record<string, CellValue>> =>
    Array.from({ length: n }, (_, i) => ({ id: i, name: `Row ${i}`, score: i * 2 }))

describe('DataGrid', () => {
    it('windows rows, does not mount the whole dataset', () => {
        render(<DataGrid columns={columns} rows={makeRows(5000)} height={400} />)
        const cells = screen.getAllByRole('gridcell')
        // Far fewer than 5000 × 3 cells are in the DOM.
        expect(cells.length).toBeGreaterThan(0)
        expect(cells.length).toBeLessThan(400)
        expect(screen.getByText('Row 0')).toBeInTheDocument()
        expect(screen.queryByText('Row 4000')).not.toBeInTheDocument()
    })

    it('renders headers and the row-number gutter', () => {
        render(<DataGrid columns={columns} rows={makeRows(3)} />)
        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Score')).toBeInTheDocument()
        // Gutter numbers are 1-based; '3' only appears in the gutter here.
        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows the empty state with no rows', () => {
        render(<DataGrid columns={columns} rows={[]} emptyState="Nothing yet" />)
        expect(screen.getByText('Nothing yet')).toBeInTheDocument()
    })

    it('edits an editable cell and emits onCellEdit', () => {
        const onCellEdit = vi.fn()
        render(<DataGrid columns={columns} rows={makeRows(3)} editable onCellEdit={onCellEdit} />)
        const cell = screen.getByText('4') // score of row index 2 (2*2)
        fireEvent.doubleClick(cell)
        const input = screen.getByDisplayValue('4') as HTMLInputElement
        fireEvent.change(input, { target: { value: '42' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onCellEdit).toHaveBeenCalledWith({ row: 2, column: 'score', value: '42' })
    })

    it('falls back to the default width for relative units instead of truncating to px', () => {
        // '50%' must NOT become a 50px column; it falls back to the 140px default.
        render(<DataGrid columns={[{ key: 'a', label: 'A', width: '50%' }]} rows={[{ a: 'x' }]} virtualize={false} />)
        const cell = screen.getByText('x').closest('[role="gridcell"]') as HTMLElement
        expect(cell.style.width).toBe('140px')
    })

    it('honours px-string widths', () => {
        render(<DataGrid columns={[{ key: 'a', label: 'A', width: '90px' }]} rows={[{ a: 'x' }]} virtualize={false} />)
        const cell = screen.getByText('x').closest('[role="gridcell"]') as HTMLElement
        expect(cell.style.width).toBe('90px')
    })

    it('sorts on header click (asc → desc → off) and keeps edits pointed at the original row', () => {
        const onCellEdit = vi.fn()
        const sortCols: GridColumn[] = [
            { key: 'name', label: 'Name', sortable: true },
            { key: 'score', label: 'Score', sortable: true, editable: true },
        ]
        // Scores avoid 1/2/3 so they don't collide with the row-number gutter.
        const sortRows: Array<Record<string, CellValue>> = [
            { name: 'C', score: 30 },
            { name: 'A', score: 10 },
            { name: 'B', score: 20 },
        ]
        render(<DataGrid columns={sortCols} rows={sortRows} sortable editable virtualize={false} onCellEdit={onCellEdit} />)

        const firstName = () => (screen.getAllByRole('gridcell')[0].textContent || '').trim()
        expect(firstName()).toBe('C') // unsorted: original order

        fireEvent.click(screen.getByText('Name'))
        expect(firstName()).toBe('A') // asc

        fireEvent.click(screen.getByText('Name'))
        expect(firstName()).toBe('C') // desc

        fireEvent.click(screen.getByText('Name'))
        expect(firstName()).toBe('C') // cleared → original order

        // Sort asc again, then edit the top row's score (display 'A' = original row 1).
        fireEvent.click(screen.getByText('Name'))
        fireEvent.doubleClick(screen.getByText('10'))
        const input = screen.getByDisplayValue('10') as HTMLInputElement
        fireEvent.change(input, { target: { value: '99' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onCellEdit).toHaveBeenCalledWith({ row: 1, column: 'score', value: '99' })
    })

    it('selects a cell on click (aria-selected)', () => {
        render(<DataGrid columns={columns} rows={makeRows(3)} />)
        const cell = screen.getByText('Row 1').closest('[role="gridcell"]') as HTMLElement
        fireEvent.click(cell)
        expect(cell).toHaveAttribute('aria-selected', 'true')
    })

    it('shows a Copy/Cut/Paste menu when a cell is right-clicked', async () => {
        render(<DataGrid columns={columns} rows={makeRows(3)} editable contextMenu virtualize={false} onCellEdit={vi.fn()} />)
        fireEvent.contextMenu(screen.getByText('Row 0'))
        expect(await screen.findByRole('menuitem', { name: 'Copy' })).toBeInTheDocument()
        expect(screen.getByRole('menuitem', { name: 'Cut' })).toBeInTheDocument()
        expect(screen.getByRole('menuitem', { name: 'Paste' })).toBeInTheDocument()
    })

    it('right-clicking a row gutter offers add/delete and fires onInsertRow', async () => {
        const onInsertRow = vi.fn()
        render(<DataGrid columns={columns} rows={makeRows(3)} editable contextMenu virtualize={false} onCellEdit={vi.fn()} onInsertRow={onInsertRow} onDeleteRow={vi.fn()} />)
        // '3' is unique to the gutter (row 3) for this data.
        fireEvent.contextMenu(screen.getByText('3'))
        fireEvent.click(await screen.findByRole('menuitem', { name: 'Add row below' }))
        expect(onInsertRow).toHaveBeenCalledWith(3)
    })

    it('does not edit a non-editable column', () => {
        const onCellEdit = vi.fn()
        render(<DataGrid columns={columns} rows={makeRows(3)} editable onCellEdit={onCellEdit} />)
        fireEvent.doubleClick(screen.getByText('Row 0'))
        expect(screen.queryByDisplayValue('Row 0')).not.toBeInTheDocument()
        expect(onCellEdit).not.toHaveBeenCalled()
    })
})
