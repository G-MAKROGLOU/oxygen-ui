import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DateRangePicker, { type DateRange } from './DateRangePicker'

function Harness({ onChange, ...rest }: { onChange?: (r: DateRange) => void } & Partial<React.ComponentProps<typeof DateRangePicker>>) {
    const [r, setR] = useState<DateRange>(rest.value ?? { start: null, end: null })
    return <DateRangePicker label="Period" htmlFor="p" {...rest} value={r} onChange={(v) => { setR(v); onChange?.(v) }} />
}

describe('DateRangePicker', () => {
    it('shows the placeholder when unset', () => {
        render(<Harness placeholder="Pick range" />)
        expect(screen.getByText('Pick range')).toBeInTheDocument()
    })

    it('shows both dates when a range is set', () => {
        render(<Harness value={{ start: new Date(2026, 4, 1), end: new Date(2026, 4, 10) }} />)
        expect(screen.getByText(/2026-05-01 – 2026-05-10/)).toBeInTheDocument()
    })

    it('opens two month grids on click', () => {
        render(<Harness placeholder="Pick range" />)
        // Trigger's accessible name is its associated label ("Period").
        fireEvent.click(screen.getByRole('button', { name: 'Period' }))
        // weekday headers appear twice (two months)
        expect(screen.getAllByText('Sun').length).toBe(2)
    })

    it('applies a preset', () => {
        const onChange = vi.fn()
        const start = new Date(2026, 0, 1)
        const end = new Date(2026, 0, 7)
        render(<Harness onChange={onChange} presets={[{ label: 'Fixed week', range: () => ({ start, end }) }]} />)
        fireEvent.click(screen.getByRole('button', { name: 'Period' }))
        fireEvent.click(screen.getByRole('button', { name: 'Fixed week' }))
        expect(onChange).toHaveBeenCalledWith({ start, end })
    })
})
