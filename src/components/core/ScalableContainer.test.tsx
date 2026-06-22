import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TooltipProvider } from './Tooltip'
import ScalableContainer from './ScalableContainer'

const renderWithTooltips = (ui: React.ReactElement) => render(<TooltipProvider>{ui}</TooltipProvider>)

describe('ScalableContainer', () => {
    it('toggles expanded state and keeps content mounted', () => {
        renderWithTooltips(
            <ScalableContainer width={200} height={100}>
                <span>chart</span>
            </ScalableContainer>,
        )
        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
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

    it('grows its own box to targetWidth/targetHeight and becomes flex:none while expanded', () => {
        renderWithTooltips(
            <ScalableContainer width="100%" height={240} targetWidth={900} targetHeight={520}>
                <span>chart</span>
            </ScalableContainer>,
        )
        const box = screen.getByText('chart').closest('.rounded-lg') as HTMLElement

        // Resting: fills its slot, participates in flex normally.
        expect(box.style.width).toBe('100%')
        expect(box.style.height).toBe('240px')
        expect(box.style.flex).toBe('')

        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))

        // Expanded: own box grows to the target and holds it (flex:none) so it
        // pushes neighbours instead of being squeezed. Siblings are untouched.
        expect(box.style.width).toBe('900px')
        expect(box.style.height).toBe('520px')
        // `flex: none` serialises to its longhand — i.e. no grow, no shrink.
        expect(box.style.flexGrow).toBe('0')
        expect(box.style.flexShrink).toBe('0')
    })

    it('does not mutate sibling elements (neighbours keep their own dimensions)', () => {
        render(
            <TooltipProvider>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <div data-testid="neighbour" style={{ flex: '1 1 0%' }}>neighbour</div>
                    <ScalableContainer width="50%" height={200} targetWidth="100%" targetHeight={400}>
                        <span>chart</span>
                    </ScalableContainer>
                </div>
            </TooltipProvider>,
        )
        const neighbour = screen.getByTestId('neighbour')
        const before = neighbour.getAttribute('style')
        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
        // The component never writes to siblings — its inline style is unchanged.
        expect(neighbour.getAttribute('style')).toBe(before)
    })

    it('falls back to expandedWidth/expandedHeight when no target is given', () => {
        renderWithTooltips(
            <ScalableContainer width={300} height={150} expandedWidth={700} expandedHeight={450}>
                <span>chart</span>
            </ScalableContainer>,
        )
        const box = screen.getByText('chart').closest('.rounded-lg') as HTMLElement
        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
        expect(box.style.width).toBe('700px')
        expect(box.style.height).toBe('450px')
    })

    it('emits window resize kicks so charts re-measure on toggle', async () => {
        renderWithTooltips(
            <ScalableContainer width="100%" height={200} targetHeight={500}>
                <span>chart</span>
            </ScalableContainer>,
        )
        const onResize = vi.fn()
        window.addEventListener('resize', onResize)
        fireEvent.click(screen.getByRole('button', { name: 'Expand container' }))
        await waitFor(() => expect(onResize).toHaveBeenCalled())
        window.removeEventListener('resize', onResize)
    })
})
