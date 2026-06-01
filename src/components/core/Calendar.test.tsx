import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import Calendar from './Calendar'

const JUNE_2026 = new Date(2026, 5, 15)

describe('Calendar', () => {
    it('renders the visible month header and weekday row', () => {
        render(<Calendar month={JUNE_2026} />)
        expect(screen.getByText('June 2026')).toBeInTheDocument()
        expect(screen.getByText('Sun')).toBeInTheDocument()
    })

    it('selects a day on click', () => {
        const onChange = vi.fn()
        render(<Calendar month={JUNE_2026} onChange={onChange} />)
        const grid = screen.getByRole('grid')
        // 15 is unique to the visible June grid (May/July 15 fall outside it).
        fireEvent.click(within(grid).getByText('15'))
        expect(onChange).toHaveBeenCalledTimes(1)
        const picked = onChange.mock.calls[0][0] as Date
        expect(picked.getDate()).toBe(15)
        expect(picked.getMonth()).toBe(5)
    })

    it('pages to the previous month', () => {
        const onMonthChange = vi.fn()
        render(<Calendar defaultMonth={JUNE_2026} onMonthChange={onMonthChange} />)
        fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
        expect(screen.getByText('May 2026')).toBeInTheDocument()
    })

    it('marks the selected day as aria-selected', () => {
        render(<Calendar month={JUNE_2026} value={new Date(2026, 5, 12)} />)
        const grid = screen.getByRole('grid')
        const cell = within(grid).getByText('12').closest('button')
        expect(cell).toHaveAttribute('aria-selected', 'true')
    })
})
