import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import PopConfirm from './PopConfirm'
import Button from '../inputs/Button'

const meta: Meta<typeof PopConfirm> = {
    title: 'Feedback/PopConfirm',
    component: PopConfirm,
    parameters: { layout: 'centered' },
    argTypes: {
        tone: { control: 'inline-radio', options: ['default', 'danger'] },
        side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    },
}
export default meta
type Story = StoryObj<typeof PopConfirm>

const WarnIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
)

export const Danger: Story = {
    args: {
        tone: 'danger',
        title: 'Delete this vessel?',
        description: 'This permanently removes the record.',
        confirmText: 'Delete',
    },
    render: (args) => (
        <PopConfirm {...args} icon={WarnIcon} onConfirm={() => {}}>
            <Button content="Delete" variant="danger" />
        </PopConfirm>
    ),
}

export const Default: Story = {
    args: { title: 'Publish changes?', confirmText: 'Publish' },
    render: (args) => (
        <PopConfirm {...args} onConfirm={() => {}}>
            <Button content="Publish" />
        </PopConfirm>
    ),
}

export const Async: Story = {
    name: 'Async confirm (loading)',
    render: () => (
        <PopConfirm
            title="Archive this item?"
            confirmText="Archive"
            onConfirm={() => new Promise((r) => setTimeout(r, 1200))}
        >
            <Button content="Archive" variant="secondary" />
        </PopConfirm>
    ),
}
