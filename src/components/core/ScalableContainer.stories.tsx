import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TooltipProvider } from './Tooltip'
import ScalableContainer from './ScalableContainer'

const meta: Meta<typeof ScalableContainer> = {
    title: 'Layout/ScalableContainer',
    component: ScalableContainer,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    decorators: [(Story) => <TooltipProvider><Story /></TooltipProvider>],
}
export default meta
type Story = StoryObj<typeof ScalableContainer>

export const Default: Story = {
    name: 'Subtle expand — both axes',
    render: () => (
        <div className="h-[400px] w-full bg-surface-raised rounded-lg p-4">
            <ScalableContainer width="50%" height={200}>
                <div className="h-full w-full bg-surface p-4 text-sm text-foreground">
                    Click the chevron in the corner to expand to 100% × 100% of the parent.
                    Shadow lifts, content stays visible, no flash of colour.
                </div>
            </ScalableContainer>
        </div>
    ),
}

export const TogglePositions: Story = {
    name: 'Toggle button position',
    render: () => (
        <div className="grid grid-cols-2 gap-4">
            {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map((pos) => (
                <div key={pos} className="h-48 bg-surface-raised rounded-lg p-3">
                    <ScalableContainer width="100%" height="100%" togglePosition={pos}>
                        <div className="h-full w-full bg-surface p-4 text-sm text-foreground flex items-center justify-center font-mono">
                            {pos}
                        </div>
                    </ScalableContainer>
                </div>
            ))}
        </div>
    ),
}
