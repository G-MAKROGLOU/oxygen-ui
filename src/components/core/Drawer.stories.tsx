import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
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

const DrawerDemo = (args: React.ComponentProps<typeof Drawer>) => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button content="Open Drawer" onClick={() => setOpen(true)} />
            <Drawer
                {...args}
                isOpen={open}
                onClose={() => setOpen(false)}
                onOk={() => setOpen(false)}
                onCancel={() => setOpen(false)}
            />
        </>
    )
}

export const Right: Story = {
    render: (args) => <DrawerDemo {...args} />,
    args: {
        title: 'Right Drawer',
        placement: 'right',
        children: <p className="text-sm text-foreground-secondary">Drawer content goes here.</p>,
    },
}

export const Left: Story = {
    render: (args) => <DrawerDemo {...args} />,
    args: {
        title: 'Left Drawer',
        placement: 'left',
        children: <p className="text-sm text-foreground-secondary">Left drawer content.</p>,
    },
}

export const WithoutFooter: Story = {
    render: (args) => <DrawerDemo {...args} />,
    args: {
        title: 'Filters',
        hasFooter: false,
        children: <p className="text-sm text-foreground-secondary">No footer — dismiss with the close button or Escape.</p>,
    },
}

export const Wide: Story = {
    render: (args) => <DrawerDemo {...args} />,
    args: {
        title: 'Wide Drawer',
        width: 480,
        children: <p className="text-sm text-foreground-secondary">A wider 480 px panel for richer content.</p>,
    },
}
