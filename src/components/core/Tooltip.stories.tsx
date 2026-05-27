import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Tooltip, { TooltipProvider } from './Tooltip'
import Button from '../inputs/Button'

const meta: Meta<typeof Tooltip> = {
    title: 'Core/Tooltip',
    component: Tooltip,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    decorators: [(Story) => <TooltipProvider><Story /></TooltipProvider>],
}
export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
    args: {
        content: 'This is a tooltip',
        children: <Button content="Hover me" />,
    },
}

export const Top: Story = {
    args: {
        content: 'Tooltip on top',
        placement: 'top',
        children: <Button content="Hover me" />,
    },
}

export const Left: Story = {
    args: {
        content: 'Tooltip on left',
        placement: 'left',
        children: <Button content="Hover me" />,
    },
}
