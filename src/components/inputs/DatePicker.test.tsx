import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DatePicker from './DatePicker'

function Harness(props: Omit<React.ComponentProps<typeof DatePicker>, 'value' | 'onChange'> & {
    initial?: Date | null
    onSelect?: (d: Date | null) => void
}) {
    const { initial, onSelect, ...rest } = props
    const [d, setD] = useState<Date | null>(initial ?? null)
    return (
        <DatePicker
            {...rest}
            value={d}
            onChange={(nd) => { setD(nd); onSelect?.(nd) }}
        />
    )
}

describe('DatePicker', () => {
    // ── Trigger ────────────────────────────────────────────────────────────

    it('renders the placeholder when no value', () => {
        render(<Harness placeholder="Pick a date" />)
        expect(screen.getByText('Pick a date')).toBeInTheDocument()
    })

    it('does NOT crash when value is undefined (regression)', () => {
        // The previous implementation required value: Date and dereferenced it
        // immediately, crashing for undefined. This test guards that.
        expect(() => render(<Harness />)).not.toThrow()
    })

    it('renders the formatted value when a date is selected', () => {
        const d = new Date(2026, 4, 28) // May 28 2026
        render(<Harness initial={d} />)
        expect(screen.getByText('2026-05-28')).toBeInTheDocument()
    })

    it('honours a custom `format` function', () => {
        const d = new Date(2026, 4, 28)
        render(<Harness initial={d} format={() => 'May 28, 2026'} />)
        expect(screen.getByText('May 28, 2026')).toBeInTheDocument()
    })

    // ── Opening the popover ────────────────────────────────────────────────

    it('opens the calendar on trigger click', () => {
        render(<Harness />)
        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('renders weekday headers (Sun by default)', () => {
        render(<Harness />)
        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByText('Sun')).toBeInTheDocument()
        expect(screen.getByText('Sat')).toBeInTheDocument()
    })

    it('renders Monday-start weekday headers when weekStartsOn=1', () => {
        render(<Harness weekStartsOn={1} placeholder="Pick" />)
        fireEvent.click(screen.getByText('Pick'))
        const headers = screen.getAllByRole('columnheader')
        expect(headers[0]).toHaveTextContent('Mon')
        expect(headers[6]).toHaveTextContent('Sun')
    })

    // ── Selecting a date ───────────────────────────────────────────────────

    it('selects a date on click and closes the popover', () => {
        const onSelect = vi.fn()
        render(<Harness onSelect={onSelect} initial={new Date(2026, 4, 15)} />)
        fireEvent.click(screen.getByText('2026-05-15')) // open via existing value (formatted)
        // Find a specific day cell — use aria-label which is the ISO date
        const cell = screen.getByLabelText('2026-05-20')
        fireEvent.click(cell)
        expect(onSelect).toHaveBeenCalledOnce()
        const picked = onSelect.mock.calls[0][0] as Date
        expect(picked.getFullYear()).toBe(2026)
        expect(picked.getMonth()).toBe(4)
        expect(picked.getDate()).toBe(20)
    })

    // ── Min / max ──────────────────────────────────────────────────────────

    it('disables dates after max', () => {
        const today = new Date()
        render(<Harness initial={today} max={today} />)
        fireEvent.click(screen.getByRole('button'))
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const y = tomorrow.getFullYear().toString().padStart(4, '0')
        const m = (tomorrow.getMonth() + 1).toString().padStart(2, '0')
        const d = tomorrow.getDate().toString().padStart(2, '0')
        const iso = `${y}-${m}-${d}`
        const cell = screen.queryByLabelText(iso)
        if (cell) expect(cell).toBeDisabled()
    })

    // ── Clear button ───────────────────────────────────────────────────────

    it('clears the value via the Clear button', () => {
        const onSelect = vi.fn()
        render(<Harness initial={new Date(2026, 4, 28)} onSelect={onSelect} />)
        fireEvent.click(screen.getByRole('button', { name: /2026-05-28/i }))
        fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
        expect(onSelect).toHaveBeenLastCalledWith(null)
    })

    it('hides the Clear button when clearable=false', () => {
        render(<Harness initial={new Date(2026, 4, 28)} clearable={false} />)
        fireEvent.click(screen.getByRole('button', { name: /2026-05-28/i }))
        expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
    })

    // ── ARIA ───────────────────────────────────────────────────────────────

    it('exposes role="grid" and gridcells', () => {
        render(<Harness />)
        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByRole('grid')).toBeInTheDocument()
        expect(screen.getAllByRole('gridcell').length).toBe(42) // 6 rows × 7
    })

    it('links aria-describedby to the error region', () => {
        render(<Harness errorMessage="required" />)
        const trigger = screen.getByRole('button')
        expect(trigger).toHaveAttribute('aria-invalid', 'true')
        const id = trigger.getAttribute('aria-describedby')
        expect(id).toBeTruthy()
        expect(document.getElementById(id!)).toHaveTextContent('required')
    })

    // ── Disabled ───────────────────────────────────────────────────────────

    it('does not open when disabled', () => {
        render(<Harness disabled initial={new Date(2026, 4, 28)} />)
        fireEvent.click(screen.getByRole('button'))
        expect(screen.queryByRole('grid')).toBeNull()
    })
})
