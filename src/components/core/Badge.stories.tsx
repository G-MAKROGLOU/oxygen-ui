import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Badge from './Badge'
import IconButton from './IconButton'

const meta: Meta<typeof Badge> = {
    title: 'Data Display/Badge',
    component: Badge,
    parameters: { layout: 'centered' },
    argTypes: {
        tone: { control: 'inline-radio', options: ['neutral', 'accent', 'success', 'warning', 'error', 'info'] },
        variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline'] },
        size: { control: 'inline-radio', options: ['sm', 'md'] },
    },
}
export default meta
type Story = StoryObj<typeof Badge>

const Bell = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>

export const Labels: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">Draft</Badge>
            <Badge tone="success" variant="soft">Active</Badge>
            <Badge tone="warning" variant="soft">Pending</Badge>
            <Badge tone="error" variant="solid">Failed</Badge>
            <Badge tone="accent" variant="outline">Beta</Badge>
            <Badge tone="info" variant="soft">Info</Badge>
        </div>
    ),
}

export const Counts: Story = {
    render: () => (
        <div className="flex items-center gap-6">
            <Badge count={3} tone="error" />
            <Badge count={42} tone="accent" />
            <Badge count={1280} max={99} tone="success" />
            <Badge count={0} tone="neutral" showZero />
        </div>
    ),
}

export const Overlay: Story = {
    render: () => (
        <div className="flex items-center gap-8">
            <Badge count={5} tone="error">
                <IconButton icon={Bell} title="Notifications" type="bordered" />
            </Badge>
            <Badge dot tone="success">
                <IconButton icon={Bell} title="Status" type="bordered" />
            </Badge>
        </div>
    ),
}
