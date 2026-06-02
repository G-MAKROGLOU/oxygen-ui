import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Drawer from './Drawer'
import Button from '../inputs/Button'

const meta: Meta<typeof Drawer> = {
    title: 'Feedback/Drawer',
    component: Drawer,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        placement: { control: 'inline-radio', options: ['left', 'right'] },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    },
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

export const Large: Story = {
    render: (args) => <DrawerDemo {...args} />,
    args: {
        title: 'Large Drawer',
        size: 'lg',
        children: <p className="text-sm text-foreground-secondary">A 480 px panel for richer content.</p>,
    },
}

export const ExplicitWidth: Story = {
    render: (args) => <DrawerDemo {...args} />,
    args: {
        title: 'Custom Width',
        width: '30rem',
        children: <p className="text-sm text-foreground-secondary">An explicit <code>width=&quot;30rem&quot;</code> overrides the size scale.</p>,
    },
}
