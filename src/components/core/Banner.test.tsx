import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Banner from './Banner'

describe('Banner', () => {
    it('renders its content', () => {
        render(<Banner tone="info">Heads up</Banner>)
        expect(screen.getByText('Heads up')).toBeInTheDocument()
    })

    it('renders a default tone icon when none is provided', () => {
        const { container } = render(<Banner tone="success">Saved</Banner>)
        expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('uses a custom icon over the default', () => {
        render(<Banner tone="info" icon={<span data-testid="custom">★</span>}>Hi</Banner>)
        expect(screen.getByTestId('custom')).toBeInTheDocument()
    })

    it('shows a dismiss button only when onDismiss is given, and calls it', () => {
        const onDismiss = vi.fn()
        const { rerender } = render(<Banner tone="info">No dismiss</Banner>)
        expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()

        rerender(<Banner tone="info" onDismiss={onDismiss}>With dismiss</Banner>)
        fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
        expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('is an assertive alert for warning/danger and polite status otherwise', () => {
        const { rerender } = render(<Banner tone="danger">Bad</Banner>)
        expect(screen.getByRole('alert')).toBeInTheDocument()
        rerender(<Banner tone="info">FYI</Banner>)
        expect(screen.getByRole('status')).toBeInTheDocument()
    })
})
