import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Drawer from './Drawer'
import Button from '../inputs/Button'

const meta: Meta<typeof Drawer> = {
    title: 'Feedback/Drawer',
    component: Drawer,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Drawer>

const Demo = (args: React.ComponentProps<typeof Drawer>) => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button content="Open Drawer" onClick={() => setOpen(true)} />
            <Drawer {...args} isOpen={open} onClose={() => setOpen(false)} />
        </>
    )
}

export const Right: Story = {
    render: (args) => <Demo {...args} />,
    args: {
        title: 'Right Drawer',
        placement: 'right',
        children: <p className="p-4 text-sm">Drawer content goes here.</p>,
    },
}

export const Left: Story = {
    render: (args) => <Demo {...args} />,
    args: {
        title: 'Left Drawer',
        placement: 'left',
        children: <p className="p-4 text-sm">Left drawer content.</p>,
    },
}
