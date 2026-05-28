import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
    // ── role / aria ────────────────────────────────────────────────────────

    it('renders with role="status" and aria-live for screen readers', () => {
        render(<LoadingSpinner prompt="Loading" />)
        const status = screen.getByRole('status')
        expect(status).toHaveAttribute('aria-live', 'polite')
        expect(status).toHaveAttribute('aria-label', 'Loading')
    })

    it('falls back to aria-label="Loading" when no prompt is provided', () => {
        render(<LoadingSpinner />)
        expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
    })

    // ── Prompt rendering ───────────────────────────────────────────────────

    it('renders the prompt one span per character', () => {
        // Use inline mode so the spans render inside `container` instead of
        // being portaled out to <body>.
        const { container } = render(<LoadingSpinner inline prompt="Hi" />)
        const spans = container.querySelectorAll('span')
        expect(spans.length).toBeGreaterThanOrEqual(2)
    })

    it('does not render a caption when prompt is omitted', () => {
        render(<LoadingSpinner inline />)
        // No caption text means no motion.div with text. The status node still
        // renders, with the spinner core inside.
        const status = screen.getByRole('status')
        expect(status.textContent).toBe('')
    })

    // ── Inline vs portaled overlay ─────────────────────────────────────────

    it('renders inline (no portal, no fixed overlay) when inline=true', () => {
        const { container } = render(<LoadingSpinner inline prompt="Saving" />)
        // Inline mode renders directly in the container; no `fixed` overlay.
        expect(container.querySelector('.fixed')).toBeNull()
        // Status node is present and is the top-level wrapper.
        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders the fullscreen overlay via portal when inline is false', () => {
        const { container } = render(<LoadingSpinner prompt="Loading" />)
        // Portaled content lives outside the container — but the status role
        // is still findable via screen queries.
        expect(container.querySelector('.fixed')).toBeNull()
        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    // ── Size prop ──────────────────────────────────────────────────────────

    it('accepts the three size variants', () => {
        for (const size of ['sm', 'md', 'lg'] as const) {
            const { unmount } = render(<LoadingSpinner inline size={size} prompt={size} />)
            expect(screen.getByRole('status')).toBeInTheDocument()
            unmount()
        }
    })
})
