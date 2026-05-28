import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Dropdown from './Dropdown'

const ITEMS = [
    { key: 1, label: 'Aurora'  },
    { key: 2, label: 'Beacon'  },
    { key: 3, label: 'Catalina' },
]

function Controlled({ onChange }: { onChange?: (v: unknown) => void }) {
    const [v, setV] = useState<unknown>(undefined)
    return (
        <Dropdown
            label="Vessel"
            htmlFor="v"
            items={ITEMS}
            value={v as 1 | 2 | 3 | undefined}
            onChange={(e) => { setV(e.target.value); onChange?.(e.target.value) }}
        />
    )
}

describe('Dropdown', () => {
    it('opens on click and renders items', () => {
        render(<Controlled />)
        fireEvent.click(screen.getByRole('combobox'))
        expect(screen.getByText('Aurora')).toBeInTheDocument()
        expect(screen.getByText('Beacon')).toBeInTheDocument()
    })

    it('selects an item and reports it via onChange', () => {
        const fn = vi.fn()
        render(<Controlled onChange={fn} />)
        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.click(screen.getByText('Beacon'))
        expect(fn).toHaveBeenCalledWith(2)
    })

    it('opens on ArrowDown for keyboard users', () => {
        render(<Controlled />)
        const trigger = screen.getByRole('combobox')
        trigger.focus()
        fireEvent.keyDown(trigger, { key: 'ArrowDown' })
        expect(screen.getByText('Aurora')).toBeInTheDocument()
    })
})
