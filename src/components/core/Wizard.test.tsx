import React, { useRef } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Wizard, { type WizardStep } from './Wizard'

beforeEach(() => {
    // Each test gets a fresh localStorage
    window.localStorage.clear()
})

// Helper component that supplies refs into the Wizard
function Harness({
    onComplete,
    onSkip,
    storageKey = null,
    dismissible,
}: {
    onComplete?: () => void
    onSkip?: () => void
    storageKey?: string | null
    dismissible?: boolean
}) {
    const ref1 = useRef<HTMLDivElement>(null)
    const ref2 = useRef<HTMLDivElement>(null)
    const steps: WizardStep[] = [
        { stepRef: ref1, title: 'Step one', description: 'First description' },
        { stepRef: ref2, title: 'Step two', description: 'Second description' },
    ]
    return (
        <Wizard
            steps={steps}
            storageKey={storageKey}
            dismissible={dismissible}
            onComplete={onComplete}
            onSkip={onSkip}
        >
            <div ref={ref1} data-testid="target-1">Target 1</div>
            <div ref={ref2} data-testid="target-2">Target 2</div>
        </Wizard>
    )
}

describe('Wizard', () => {
    // ── Open / step rendering ──────────────────────────────────────────────

    it('opens to the first step and renders its content', () => {
        render(<Harness />)
        expect(screen.getByText('Step one')).toBeInTheDocument()
        expect(screen.getByText('First description')).toBeInTheDocument()
        expect(screen.getByText('1 / 2')).toBeInTheDocument()
    })

    it('advances to the next step on Next', () => {
        render(<Harness />)
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        expect(screen.getByText('Step two')).toBeInTheDocument()
        expect(screen.getByText('2 / 2')).toBeInTheDocument()
    })

    it('shows "Done" instead of "Next" on the last step', () => {
        render(<Harness />)
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
    })

    it('goes back to the previous step on Back', () => {
        render(<Harness />)
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        fireEvent.click(screen.getByRole('button', { name: 'Back' }))
        expect(screen.getByText('Step one')).toBeInTheDocument()
    })

    it('does not render Back on the first step', () => {
        render(<Harness />)
        expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
    })

    // ── Completion + persistence ───────────────────────────────────────────

    it('fires onComplete when Done is clicked on the last step', async () => {
        const onComplete = vi.fn()
        render(<Harness onComplete={onComplete} />)
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        fireEvent.click(screen.getByRole('button', { name: 'Done' }))
        expect(onComplete).toHaveBeenCalledOnce()
        // Tooltip closes (after the AnimatePresence exit animation completes)
        await waitFor(() => expect(screen.queryByText('Step two')).toBeNull())
    })

    it('persists completion to localStorage when a storageKey is provided', () => {
        render(<Harness storageKey="wiz-test" />)
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        fireEvent.click(screen.getByRole('button', { name: 'Done' }))
        expect(window.localStorage.getItem('wiz-test')).toBe('true')
    })

    it('does not reopen when localStorage flag is already set', () => {
        window.localStorage.setItem('wiz-test', 'true')
        render(<Harness storageKey="wiz-test" />)
        expect(screen.queryByText('Step one')).toBeNull()
    })

    // ── Skip / dismiss ─────────────────────────────────────────────────────

    it('fires onSkip and closes when Skip is clicked', async () => {
        const onSkip = vi.fn()
        render(<Harness onSkip={onSkip} />)
        fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
        expect(onSkip).toHaveBeenCalledOnce()
        await waitFor(() => expect(screen.queryByText('Step one')).toBeNull())
    })

    it('does not show Skip when dismissible=false', () => {
        render(<Harness dismissible={false} />)
        expect(screen.queryByRole('button', { name: 'Skip' })).toBeNull()
    })

    it('closes on Escape when dismissible', () => {
        const onSkip = vi.fn()
        render(<Harness onSkip={onSkip} />)
        fireEvent.keyDown(document, { key: 'Escape' })
        expect(onSkip).toHaveBeenCalledOnce()
    })

    it('does NOT close on Escape when dismissible=false', () => {
        const onSkip = vi.fn()
        render(<Harness onSkip={onSkip} dismissible={false} />)
        fireEvent.keyDown(document, { key: 'Escape' })
        expect(onSkip).not.toHaveBeenCalled()
        expect(screen.getByText('Step one')).toBeInTheDocument()
    })

    // ── ARIA ───────────────────────────────────────────────────────────────

    it('exposes the tooltip with role="dialog" and aria-modal="true"', () => {
        render(<Harness />)
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveAttribute('aria-modal', 'true')
    })
})
