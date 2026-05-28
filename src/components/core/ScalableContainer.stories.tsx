import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import ScalableContainer from './ScalableContainer'

const meta: Meta<typeof ScalableContainer> = {
    title: 'Layout/ScalableContainer',
    component: ScalableContainer,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof ScalableContainer>

export const Default: Story = {
    render: () => (
        <ScalableContainer width="60%" height={240}>
            <div className="p-4 text-sm text-foreground">
                Click the expand icon (top-left) to scale this container to 100% × 100%.
            </div>
        </ScalableContainer>
    ),
}
