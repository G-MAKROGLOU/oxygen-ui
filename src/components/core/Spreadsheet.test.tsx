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

    it('shows an export menu when formats are configured', () => {
        render(<Spreadsheet source={sheets} export={['csv', 'xlsx']} />)
        expect(screen.getByRole('button', { name: /Export/ })).toBeInTheDocument()
    })

    it('hides export when export={false}', () => {
        render(<Spreadsheet source={sheets} export={false} />)
        expect(screen.queryByRole('button', { name: /Export/ })).not.toBeInTheDocument()
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
