import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
    // ── Rendering ─────────────────────────────────────────────────────────

    it('renders content text', () => {
        render(<Button content="Save" />)
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('renders nothing for content when omitted', () => {
        render(<Button />)
        expect(screen.getByRole('button')).toBeEmptyDOMElement()
    })

    it('renders a spinner alongside content when loading', () => {
        const { container } = render(<Button content="Save" loading />)
        // SVG spinner is present
        expect(container.querySelector('svg.animate-spin')).toBeInTheDocument()
        // Content text still renders next to the spinner
        expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('renders icon before content', () => {
        render(<Button content="Go" icon={<span data-testid="icon" />} />)
        expect(screen.getByTestId('icon')).toBeInTheDocument()
        expect(screen.getByText('Go')).toBeInTheDocument()
    })

    // ── HTML attributes ───────────────────────────────────────────────────

    it('defaults to type="button"', () => {
        render(<Button content="Click" />)
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('respects buttonType="submit"', () => {
        render(<Button content="Submit" buttonType="submit" />)
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('is disabled when disabled=true', () => {
        render(<Button content="No" disabled />)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('is disabled when loading=true', () => {
        render(<Button content="Wait" loading />)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('applies inline style', () => {
        render(<Button content="Fixed" style={{ width: 120 }} />)
        expect(screen.getByRole('button')).toHaveStyle({ width: '120px' })
    })

    // ── Interactions ──────────────────────────────────────────────────────

    it('calls onClick when clicked', () => {
        const handler = vi.fn()
        render(<Button content="Click me" onClick={handler} />)
        fireEvent.click(screen.getByRole('button'))
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
        const handler = vi.fn()
        render(<Button content="No" disabled onClick={handler} />)
        fireEvent.click(screen.getByRole('button'))
        expect(handler).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', () => {
        const handler = vi.fn()
        render(<Button content="Wait" loading onClick={handler} />)
        fireEvent.click(screen.getByRole('button'))
        expect(handler).not.toHaveBeenCalled()
    })

    // ── Variants ──────────────────────────────────────────────────────────

    it.each([
        ['primary',   'bg-accent'],
        ['secondary', 'border-accent'],
        ['ghost',     'bg-transparent'],
        ['danger',    'bg-status-error'],
    ] as const)('variant %s applies expected class', (variant, cls) => {
        render(<Button content="x" variant={variant} />)
        expect(screen.getByRole('button').className).toContain(cls)
    })

    // ── Sizes ─────────────────────────────────────────────────────────────

    it.each([
        ['sm', 'h-7'],
        ['md', 'h-9'],
        ['lg', 'h-11'],
    ] as const)('size %s applies expected height class', (size, cls) => {
        render(<Button content="x" size={size} />)
        expect(screen.getByRole('button').className).toContain(cls)
    })
})
