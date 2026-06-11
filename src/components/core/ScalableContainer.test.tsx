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

    it('takes the full row width (wrap + basis 100%) and grows its row, restoring on collapse', async () => {
        render(<Harness />)
        const wrapperA = screen.getByTestId('wrapper-a')
        const row = screen.getByTestId('row')

        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))

        // Row parent wraps; the expanded wrapper takes the full width and
        // claims ratio/(ratio+1) of the row's height — siblings reflow below.
        expect(row.style.flexWrap).toBe('wrap')
        expect(wrapperA.style.flexBasis).toBe('100%')
        expect(wrapperA.style.height).toBe('75%')
        // The row itself (flex item of the column section) grows vertically.
        expect(row.style.flexGrow).toBe('3')
        // Siblings keep their own sizing and stay in layout.
        expect(screen.getByTestId('wrapper-b').style.flexGrow).toBe('1')
        expect(screen.getByText('chart B')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Collapse container' }))

        // Inline styles restored to what the consumer set.
        expect(wrapperA.style.flexBasis).toBe('0%')
        expect(wrapperA.style.height).toBe('')
        expect(row.style.flexGrow).toBe('')
        await waitFor(() => expect(row.style.flexWrap).toBe(''))
    })

    it('honours expandRatio', () => {
        render(<Harness ratio={4} />)
        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
        expect(screen.getByTestId('wrapper-a').style.height).toBe('80%')
        expect(screen.getByTestId('row').style.flexGrow).toBe('4')
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

    it('emits window resize kicks so charts re-measure after the push', async () => {
        render(<Harness />)
        const onResize = vi.fn()
        window.addEventListener('resize', onResize)
        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
        await waitFor(() => expect(onResize).toHaveBeenCalled())
        window.removeEventListener('resize', onResize)
    })

    it('restores consumer styles on unmount while expanded', async () => {
        const { unmount } = render(<Harness />)
        const wrapperA = screen.getByTestId('wrapper-a')
        const row = screen.getByTestId('row')
        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
        expect(wrapperA.style.flexBasis).toBe('100%')
        unmount()
        await waitFor(() => {
            expect(wrapperA.style.flexBasis).toBe('0%')
            expect(wrapperA.style.height).toBe('')
            expect(row.style.flexWrap).toBe('')
        })
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
