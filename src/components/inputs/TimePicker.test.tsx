import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TimePicker from './TimePicker'

function Harness({ onChange, ...rest }: { onChange?: (v: string | null) => void } & Partial<React.ComponentProps<typeof TimePicker>>) {
    const [v, setV] = useState<string | null>(rest.value ?? null)
    return <TimePicker label="Time" htmlFor="t" {...rest} value={v} onChange={(val) => { setV(val); onChange?.(val) }} />
}

describe('TimePicker', () => {
    it('shows the placeholder when unset', () => {
        render(<Harness placeholder="Pick time" />)
        expect(screen.getByText('Pick time')).toBeInTheDocument()
    })

    it('displays a 24h value', () => {
        render(<Harness value="14:30" />)
        expect(screen.getByText('14:30')).toBeInTheDocument()
    })

    it('displays a 12h value with period', () => {
        render(<Harness value="14:30" use12Hours />)
        expect(screen.getByText(/2:30 PM/)).toBeInTheDocument()
    })

    it('opens the column popover and selects an hour', () => {
        const onChange = vi.fn()
        render(<Harness onChange={onChange} value="00:00" />)
        // The trigger's accessible name is its associated label ("Time").
        fireEvent.click(screen.getByRole('button', { name: 'Time' }))
        // "05" appears in both the hour and minute columns; the hours column
        // is rendered first.
        fireEvent.click(screen.getAllByRole('option', { name: '05' })[0])
        expect(onChange).toHaveBeenCalledWith('05:00')
    })
})
