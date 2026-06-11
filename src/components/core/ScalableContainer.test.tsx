import React, { useRef } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TooltipProvider } from './Tooltip'
import ScalableContainer from './ScalableContainer'

const renderWithTooltips = (ui: React.ReactElement) => render(<TooltipProvider>{ui}</TooltipProvider>)

describe('ScalableContainer', () => {
    it('expands in place by default', () => {
        renderWithTooltips(
            <ScalableContainer width={200} height={100}>
                <span>chart</span>
            </ScalableContainer>,
        )
        const btn = screen.getByRole('button', { name: 'Expand container' })
        fireEvent.click(btn)
        expect(screen.getByRole('button', { name: 'Collapse container' })).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByText('chart')).toBeInTheDocument()
    })

    it('fires onExpandedChange', () => {
        const onExpandedChange = vi.fn()
        renderWithTooltips(
            <ScalableContainer onExpandedChange={onExpandedChange}>
                <span>chart</span>
            </ScalableContainer>,
        )
        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
        expect(onExpandedChange).toHaveBeenCalledWith(true)
    })
})

describe('ScalableContainer push expansion (expandContainerRef)', () => {
    // Mirrors the consumer chart grid: section → flex row → flex-item wrappers.
    function Harness({ ratio }: { ratio?: number }) {
        const sectionRef = useRef<HTMLDivElement>(null)
        return (
            <TooltipProvider>
                <div ref={sectionRef} data-testid="section" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div data-testid="row" style={{ display: 'flex' }}>
                        <div data-testid="wrapper-a" style={{ flex: '2 1 0%', minWidth: 0 }}>
                            <ScalableContainer width="100%" height="100%" expandContainerRef={sectionRef} expandRatio={ratio}>
                                <span>chart A</span>
                            </ScalableContainer>
                        </div>
                        <div data-testid="wrapper-b" style={{ flex: '1 1 0%', minWidth: 0 }}>
                            <span>chart B</span>
                        </div>
                    </div>
                </div>
            </TooltipProvider>
        )
    }

    it('raises flex-grow on the wrapper chain when expanded and restores it on collapse', () => {
        render(<Harness />)
        const wrapperA = screen.getByTestId('wrapper-a')
        const row = screen.getByTestId('row')

        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))

        // The wrapper and its row (both flex items inside the section) grow.
        expect(wrapperA.style.flexGrow).toBe('5')
        expect(row.style.flexGrow).toBe('5')
        // Siblings keep their own sizing — they shrink but stay in layout.
        expect(screen.getByTestId('wrapper-b').style.flexGrow).toBe('1')
        expect(screen.getByText('chart B')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Collapse container' }))

        // Inline styles restored to what the consumer set.
        expect(wrapperA.style.flexGrow).toBe('2')
        expect(row.style.flexGrow).toBe('')
    })

    it('honours expandRatio', () => {
        render(<Harness ratio={3} />)
        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
        expect(screen.getByTestId('wrapper-a').style.flexGrow).toBe('3')
    })

    it('does not touch elements outside the bounding section', () => {
        render(
            <TooltipProvider>
                <div data-testid="outside" style={{ display: 'flex' }}>
                    <HarnessInner />
                </div>
            </TooltipProvider>,
        )
        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
        // The section itself (a flex item of "outside") must not be grown.
        expect(screen.getByTestId('section').style.flexGrow).toBe('')
    })

    it('restores consumer styles on unmount while expanded', async () => {
        const { unmount } = render(<Harness />)
        const wrapperA = screen.getByTestId('wrapper-a')
        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
        expect(wrapperA.style.flexGrow).toBe('5')
        unmount()
        await waitFor(() => expect(wrapperA.style.flexGrow).toBe('2'))
    })
})

function HarnessInner() {
    const sectionRef = useRef<HTMLDivElement>(null)
    return (
        <div ref={sectionRef} data-testid="section" style={{ display: 'flex' }}>
            <div style={{ flex: '1 1 0%' }}>
                <ScalableContainer width="100%" height="100%" expandContainerRef={sectionRef}>
                    <span>chart</span>
                </ScalableContainer>
            </div>
        </div>
    )
}
