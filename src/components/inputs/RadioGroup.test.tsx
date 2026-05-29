import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RadioGroup, { type RadioOption } from './RadioGroup'

const OPTS: RadioOption[] = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta', description: 'the second one' },
    { value: 'c', label: 'Gamma', disabled: true },
]

function Harness({ onChange }: { onChange?: (v: string) => void }) {
    const [v, setV] = useState<string | undefined>(undefined)
    return (
        <RadioGroup
            label="Pick one"
            name="t"
            options={OPTS}
            value={v}
            onChange={(val) => { setV(val); onChange?.(val) }}
        />
    )
}

describe('RadioGroup', () => {
    it('renders all options with labels + descriptions', () => {
        render(<Harness />)
        expect(screen.getByText('Alpha')).toBeInTheDocument()
        expect(screen.getByText('Beta')).toBeInTheDocument()
        expect(screen.getByText('the second one')).toBeInTheDocument()
    })

    it('exposes a radiogroup role with radio items', () => {
        render(<Harness />)
        expect(screen.getByRole('radiogroup')).toBeInTheDocument()
        expect(screen.getAllByRole('radio')).toHaveLength(3)
    })

    it('selects an option on click and reports the value', () => {
        const onChange = vi.fn()
        render(<Harness onChange={onChange} />)
        fireEvent.click(screen.getByRole('radio', { name: /alpha/i }))
        expect(onChange).toHaveBeenCalledWith('a')
    })

    it('does not select a disabled option', () => {
        const onChange = vi.fn()
        render(<Harness onChange={onChange} />)
        const gamma = screen.getByRole('radio', { name: /gamma/i })
        expect(gamma).toBeDisabled()
        fireEvent.click(gamma)
        expect(onChange).not.toHaveBeenCalled()
    })

    it('links aria-describedby to the error region', () => {
        render(
            <RadioGroup label="x" name="y" options={OPTS} errorMessage="required" />
        )
        const group = screen.getByRole('radiogroup')
        expect(group).toHaveAttribute('aria-invalid', 'true')
        const id = group.getAttribute('aria-describedby')
        expect(id).toBeTruthy()
        expect(document.getElementById(id!)).toHaveTextContent('required')
    })
})
