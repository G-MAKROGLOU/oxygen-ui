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

describe('ScalableContainer breakout (expandContainerRef)', () => {
    function Harness() {
        const boundsRef = useRef<HTMLDivElement>(null)
        return (
            <TooltipProvider>
                <div ref={boundsRef} data-testid="bounds">
                    {/* flex-item wrapper that owns the resting size */}
                    <div data-testid="wrapper">
                        <ScalableContainer width="100%" height="100%" expandContainerRef={boundsRef}>
                            <span>chart</span>
                        </ScalableContainer>
                    </div>
                </div>
            </TooltipProvider>
        )
    }

    it('moves the content into a body portal when expanded, and back when collapsed', async () => {
        render(<Harness />)
        const wrapper = screen.getByTestId('wrapper')

        // Resting: content lives in normal flow inside the wrapper.
        expect(wrapper.contains(screen.getByText('chart'))).toBe(true)

        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))

        // Expanded: content has broken out of the wrapper into the portal.
        await waitFor(() => {
            const chart = screen.getByText('chart')
            expect(wrapper.contains(chart)).toBe(false)
            expect(document.body.contains(chart)).toBe(true)
        })
        const overlay = screen.getByText('chart').closest('.z-dropdown') as HTMLElement
        expect(overlay).not.toBeNull()
        expect(overlay.style.position).toBe('fixed')

        // Collapse: content returns to normal flow.
        fireEvent.click(screen.getByRole('button', { name: 'Collapse container' }))
        await waitFor(() => expect(wrapper.contains(screen.getByText('chart'))).toBe(true))
    })

    it('does not resize the in-flow placeholder while expanded', async () => {
        render(<Harness />)
        const containerEl = screen.getByTestId('wrapper').firstElementChild as HTMLElement

        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
        await waitFor(() => expect(document.body.contains(screen.getByText('chart'))).toBe(true))

        // The in-flow box must keep its resting size — the flex wrapper's
        // layout never changes. (jsdom reports style targets, not pixels.)
        expect(containerEl.style.width).not.toBe('')
    })
})
