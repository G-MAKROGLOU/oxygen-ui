import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Spreadsheet, { type SheetData } from './Spreadsheet'

const sheets: SheetData[] = [
    {
        name: 'Fleet',
        columns: [
            { key: 'name', label: 'Vessel', width: 200 },
            { key: 'dwt', label: 'DWT', width: 120, editable: true },
        ],
        rows: [
            { name: 'MV Aurora', dwt: 81200 },
            { name: 'MV Borealis', dwt: 115000 },
        ],
    },
    {
        name: 'Emissions',
        columns: ['month', 'co2'],
        rows: [{ month: 'Jan', co2: 1240 }],
    },
]

describe('Spreadsheet', () => {
    it('renders the first sheet from in-memory SheetData (no network)', () => {
        render(<Spreadsheet source={sheets} />)
        expect(screen.getByText('MV Aurora')).toBeInTheDocument()
        expect(screen.getByText('Vessel')).toBeInTheDocument()
    })

    it('switches sheets via the tabs', () => {
        render(<Spreadsheet source={sheets} />)
        expect(screen.queryByText('Jan')).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('tab', { name: 'Emissions' }))
        expect(screen.getByText('Jan')).toBeInTheDocument()
    })

    it('shows a File menu when formats are configured', () => {
        render(<Spreadsheet source={sheets} export={['csv', 'xlsx']} />)
        expect(screen.getByRole('button', { name: 'File' })).toBeInTheDocument()
    })

    it('always shows the File menu (Open) and hides Sheet when not editable', () => {
        render(<Spreadsheet source={sheets} export={false} />)
        expect(screen.getByRole('button', { name: 'File' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Sheet' })).not.toBeInTheDocument()
    })

    it('shows a Sheet menu when editable', () => {
        render(<Spreadsheet source={sheets} editable />)
        expect(screen.getByRole('button', { name: 'Sheet' })).toBeInTheDocument()
    })

    it('deletes a sheet via its tab × and clamps the active sheet', () => {
        const onChange = vi.fn()
        render(<Spreadsheet source={sheets} editable onChange={onChange} />)
        expect(screen.getAllByRole('tab')).toHaveLength(2)
        fireEvent.click(screen.getByRole('button', { name: 'Delete Emissions' }))
        expect(screen.getAllByRole('tab')).toHaveLength(1)
        expect(screen.queryByRole('tab', { name: 'Emissions' })).not.toBeInTheDocument()
        expect(onChange).toHaveBeenCalled()
    })

    it('never offers to delete the last remaining sheet', () => {
        render(<Spreadsheet source={[sheets[0]]} editable />)
        expect(screen.queryByRole('button', { name: /^Delete / })).not.toBeInTheDocument()
    })

    it('adds a blank sheet via the “+” when editable', () => {
        const onChange = vi.fn()
        render(<Spreadsheet source={sheets} editable onChange={onChange} />)
        expect(screen.getAllByRole('tab')).toHaveLength(2)
        fireEvent.click(screen.getByRole('button', { name: 'Add sheet' }))
        expect(screen.getAllByRole('tab')).toHaveLength(3)
        expect(onChange).toHaveBeenCalled()
        // The new sheet becomes active.
        expect(screen.getByRole('tab', { name: 'Sheet 3' })).toHaveAttribute('aria-selected', 'true')
    })

    it('does not show the add-sheet control when not editable', () => {
        render(<Spreadsheet source={sheets} />)
        expect(screen.queryByRole('button', { name: 'Add sheet' })).not.toBeInTheDocument()
    })

    it('typing into a blank slack row appends a data row', () => {
        const onChange = vi.fn()
        // One sheet with two data rows (name, dwt); blank slack rows follow.
        render(<Spreadsheet source={[sheets[0]]} editable emptyRows={20} emptyCols={0} onChange={onChange} />)
        // 2 data rows × 2 cols = 4 data cells; cell index 4 is the first blank row, col 0.
        fireEvent.doubleClick(screen.getAllByRole('gridcell')[4])
        const input = screen.getByRole('textbox') // the cell editor
        fireEvent.change(input, { target: { value: 'MV Crux' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        // The sheet grew from 2 data rows to 3.
        const grown = onChange.mock.calls.at(-1)?.[0]
        expect(grown?.[0].rows).toHaveLength(3)
        expect(grown?.[0].rows[2].name).toBe('MV Crux')
    })

    it('renders blank slack columns to the right of the data', () => {
        // Fleet has 2 data columns (Vessel, DWT); the first slack column is 'C' (index 2).
        render(<Spreadsheet source={sheets} emptyCols={3} />)
        expect(screen.getByRole('columnheader', { name: 'C' })).toBeInTheDocument()
    })

    it('does not show slack columns when emptyCols={0}', () => {
        render(<Spreadsheet source={sheets} emptyCols={0} />)
        expect(screen.queryByRole('columnheader', { name: 'C' })).not.toBeInTheDocument()
    })

    it('right-clicking a column header offers add-left/right and inserts a column', async () => {
        const onChange = vi.fn()
        render(<Spreadsheet source={[sheets[0]]} editable emptyCols={0} onChange={onChange} />)
        const before = screen.getAllByRole('columnheader').length
        fireEvent.contextMenu(screen.getByRole('columnheader', { name: 'Vessel' }))
        expect(await screen.findByRole('menuitem', { name: 'Add column to the left' })).toBeInTheDocument()
        fireEvent.click(screen.getByRole('menuitem', { name: 'Add column to the right' }))
        expect(screen.getAllByRole('columnheader').length).toBe(before + 1)
        expect(onChange).toHaveBeenCalled()
    })

    it('edits a numeric value, coerces it to a number, and emits onCellEdit + onChange', () => {
        const onCellEdit = vi.fn()
        const onChange = vi.fn()
        render(<Spreadsheet source={sheets} editable onCellEdit={onCellEdit} onChange={onChange} />)
        fireEvent.doubleClick(screen.getByText('81200'))
        const input = screen.getByDisplayValue('81200') as HTMLInputElement
        fireEvent.change(input, { target: { value: '90000' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        // Original cell was a number, so the edit round-trips as a number, not a string.
        expect(onCellEdit).toHaveBeenCalledWith({ sheet: 'Fleet', row: 0, column: 'dwt', value: 90000 })
        expect(onChange).toHaveBeenCalled()
    })
})
