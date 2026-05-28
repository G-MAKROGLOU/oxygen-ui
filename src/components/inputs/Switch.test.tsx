import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Switch from './Switch'

function Controlled({ onChange }: { onChange?: (c: boolean) => void }) {
    const [v, setV] = useState(false)
    return (
        <Switch
            checked={v}
            onChange={(e) => { setV(e.target.checked); onChange?.(e.target.checked) }}
        />
    )
}

describe('Switch (inputs)', () => {
    it('toggles on click', () => {
        const fn = vi.fn()
        render(<Controlled onChange={fn} />)
        fireEvent.click(screen.getByRole('switch'))
        expect(fn).toHaveBeenLastCalledWith(true)
        fireEvent.click(screen.getByRole('switch'))
        expect(fn).toHaveBeenLastCalledWith(false)
    })

    it('renders an aria-checked state', () => {
        render(<Switch checked />)
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    })
})
