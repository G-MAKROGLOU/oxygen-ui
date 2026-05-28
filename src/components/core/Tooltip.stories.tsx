import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Tooltip, { TooltipProvider } from './Tooltip'
import Button from '../inputs/Button'
import IconButton from './IconButton'

const meta: Meta<typeof Tooltip> = {
    title: 'Feedback/Tooltip',
    component: Tooltip,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    decorators: [(Story) => (
        <TooltipProvider>
            <div style={{ padding: 64 }}>
                <Story />
            </div>
        </TooltipProvider>
    )],
    args: {
        title: 'Helpful tooltip text',
        placement: 'top',
    },
}
export default meta
type Story = StoryObj<typeof Tooltip>

export const Top: Story = {
    args: {
        placement: 'top',
        title: 'Appears above the trigger',
        children: <Button content="Hover me" />,
    },
}

export const Bottom: Story = {
    args: {
        placement: 'bottom',
        title: 'Appears below the trigger',
        children: <Button content="Hover me" />,
    },
}

export const Left: Story = {
    args: {
        placement: 'left',
        title: 'Appears to the left',
        children: <Button content="Hover me" />,
    },
}

export const Right: Story = {
    args: {
        placement: 'right',
        title: 'Appears to the right',
        children: <Button content="Hover me" />,
    },
}

export const LongContent: Story = {
    args: {
        placement: 'top',
        title: 'This is a longer description that wraps across two lines to show max-width behaviour.',
        children: <Button content="Long tooltip" />,
    },
}

export const OnIconButton: Story = {
    args: {
        placement: 'right',
        title: 'Delete this record',
        children: (
            <IconButton
                onClick={() => undefined}
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                    </svg>
                }
            />
        ),
    },
}

export const AllPlacements: Story = {
    render: () => (
        <TooltipProvider>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: 24 }}>
                {(['top', 'bottom', 'left', 'right'] as const).map((p) => (
                    <Tooltip key={p} title={`placement="${p}"`} placement={p}>
                        <Button content={p} size="sm" variant="secondary" />
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    ),
}
