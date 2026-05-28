import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NumberInput from './NumberInput'

// Controlled wrapper for stepper interactions
function Controlled(props: Omit<React.ComponentProps<typeof NumberInput>, 'value' | 'onChange'> & {
    initial?: number
    onChange?: (v: number | undefined) => void
}) {
    const { initial, onChange, ...rest } = props
    const [v, setV] = useState<number | undefined>(initial)
    return (
        <NumberInput
            {...rest}
            value={v ?? ''}
            onChange={({ target }) => {
                setV(target.value)
                onChange?.(target.value)
            }}
        />
    )
}

describe('NumberInput', () => {
    // ── Stepper buttons ────────────────────────────────────────────────────

    it('renders increment and decrement buttons with aria-labels', () => {
        render(<Controlled initial={5} />)
        expect(screen.getByRole('button', { name: /increase/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /decrease/i })).toBeInTheDocument()
    })

    it('increments by step on click', () => {
        const onChange = vi.fn()
        render(<Controlled initial={5} step={1} onChange={onChange} />)
        fireEvent.click(screen.getByRole('button', { name: /increase/i }))
        expect(onChange).toHaveBeenLastCalledWith(6)
    })

    it('decrements by step on click', () => {
        const onChange = vi.fn()
        render(<Controlled initial={5} step={1} onChange={onChange} />)
        fireEvent.click(screen.getByRole('button', { name: /decrease/i }))
        expect(onChange).toHaveBeenLastCalledWith(4)
    })

    // ── Bounds ─────────────────────────────────────────────────────────────

    it('does not increment past max', () => {
        const onChange = vi.fn()
        render(<Controlled initial={10} step={1} max={10} onChange={onChange} />)
        const inc = screen.getByRole('button', { name: /increase/i })
        expect(inc).toBeDisabled()
        fireEvent.click(inc)
        expect(onChange).not.toHaveBeenCalled()
    })

    it('does not decrement below min', () => {
        const onChange = vi.fn()
        render(<Controlled initial={0} step={1} min={0} onChange={onChange} />)
        const dec = screen.getByRole('button', { name: /decrease/i })
        expect(dec).toBeDisabled()
        fireEvent.click(dec)
        expect(onChange).not.toHaveBeenCalled()
    })

    // ── Floating-point precision ───────────────────────────────────────────

    it('rounds floating-point drift away when stepping decimals', () => {
        const onChange = vi.fn()
        render(<Controlled initial={0.1} step={0.1} onChange={onChange} />)
        // 0.1 + 0.1 = 0.2 (not 0.20000000000000001 as raw JS produces)
        fireEvent.click(screen.getByRole('button', { name: /increase/i }))
        expect(onChange).toHaveBeenLastCalledWith(0.2)
    })

    // ── Empty value handling ───────────────────────────────────────────────

    it('resolves an emptied input to undefined (not NaN)', () => {
        const onChange = vi.fn()
        render(<Controlled initial={5} onChange={onChange} />)
        const input = screen.getByRole('spinbutton')
        fireEvent.change(input, { target: { value: '' } })
        expect(onChange).toHaveBeenLastCalledWith(undefined)
    })

    // ── Error region a11y ──────────────────────────────────────────────────

    it('sets aria-invalid and aria-describedby when errorMessage is present', () => {
        render(<Controlled initial={5} errorMessage="Too high" />)
        const input = screen.getByRole('spinbutton')
        expect(input).toHaveAttribute('aria-invalid', 'true')
        const errId = input.getAttribute('aria-describedby')
        expect(errId).toBeTruthy()
        expect(document.getElementById(errId!)).toHaveTextContent('Too high')
    })

    it('does not render an error region when errorMessage is absent', () => {
        const { container } = render(<Controlled initial={5} />)
        const input = screen.getByRole('spinbutton')
        expect(input).not.toHaveAttribute('aria-invalid')
        expect(container.textContent).not.toContain('Too high')
    })

    // ── Disabled / readOnly ────────────────────────────────────────────────

    it('disables both steppers when the input is disabled', () => {
        render(<Controlled initial={5} disabled />)
        expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled()
        expect(screen.getByRole('button', { name: /decrease/i })).toBeDisabled()
    })
})
