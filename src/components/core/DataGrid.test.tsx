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
    it('windows rows — does not mount the whole dataset', () => {
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

    it('does not edit a non-editable column', () => {
        const onCellEdit = vi.fn()
        render(<DataGrid columns={columns} rows={makeRows(3)} editable onCellEdit={onCellEdit} />)
        fireEvent.doubleClick(screen.getByText('Row 0'))
        expect(screen.queryByDisplayValue('Row 0')).not.toBeInTheDocument()
        expect(onCellEdit).not.toHaveBeenCalled()
    })
})
