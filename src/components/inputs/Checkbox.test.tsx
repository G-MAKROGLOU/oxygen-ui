import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Checkbox from './Checkbox'

function Controlled({ onChange }: { onChange?: (c: boolean) => void }) {
    const [v, setV] = useState(false)
    return (
        <Checkbox
            label="I agree"
            checked={v}
            onChange={(e) => { setV(e.target.checked); onChange?.(e.target.checked) }}
        />
    )
}

describe('Checkbox', () => {
    it('renders the label', () => {
        render(<Controlled />)
        expect(screen.getByText('I agree')).toBeInTheDocument()
    })

    it('toggles on click', () => {
        const fn = vi.fn()
        render(<Controlled onChange={fn} />)
        fireEvent.click(screen.getByRole('checkbox'))
        expect(fn).toHaveBeenLastCalledWith(true)
    })

    it('reflects aria-checked', () => {
        render(<Checkbox label="x" checked onChange={() => {}} />)
        expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')
    })
})
