import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import PopConfirm from './PopConfirm'
import Button from '../inputs/Button'
import IconButton from './IconButton'

const meta: Meta<typeof PopConfirm> = {
    title: 'Feedback/PopConfirm',
    component: PopConfirm,
    parameters: { layout: 'centered' },
    argTypes: {
        tone: { control: 'inline-radio', options: ['default', 'info', 'warning', 'error', 'danger', 'success'] },
        side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    },
}
export default meta
type Story = StoryObj<typeof PopConfirm>

// ── Shared icons ──────────────────────────────────────────────────────────────

const TrashIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
)

const WarnIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
)

const InfoIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
    </svg>
)

const CheckIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
)

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
    args: { title: 'Publish changes?', description: 'This will make the report visible to all users.', confirmText: 'Publish' },
    render: (args) => (
        <PopConfirm {...args} onConfirm={() => {}}>
            <Button content="Publish" />
        </PopConfirm>
    ),
}

export const Info: Story = {
    args: { tone: 'info', title: 'Session will expire', description: 'You will be logged out in 5 minutes.', confirmText: 'Stay logged in' },
    render: (args) => (
        <PopConfirm {...args} icon={InfoIcon} onConfirm={() => {}}>
            <Button content="Extend session" variant="secondary" />
        </PopConfirm>
    ),
}

export const Warning: Story = {
    args: { tone: 'warning', title: 'Send to 1 200 recipients?', description: 'This bulk action cannot be undone.', confirmText: 'Send' },
    render: (args) => (
        <PopConfirm {...args} icon={WarnIcon} onConfirm={() => {}}>
            <Button content="Send bulk email" variant="secondary" />
        </PopConfirm>
    ),
}

export const Error: Story = {
    args: { tone: 'error', title: 'Archive this vessel?', description: 'The record will be hidden from all reports.', confirmText: 'Archive' },
    render: (args) => (
        <PopConfirm {...args} icon={TrashIcon} onConfirm={() => {}}>
            <Button content="Archive" variant="ghost" />
        </PopConfirm>
    ),
}

export const Danger: Story = {
    args: { tone: 'danger', title: 'Delete this vessel?', description: 'This permanently removes the record and all associated data.', confirmText: 'Delete' },
    render: (args) => (
        <PopConfirm {...args} icon={TrashIcon} onConfirm={() => {}}>
            <Button content="Delete" variant="danger" />
        </PopConfirm>
    ),
}

export const Success: Story = {
    args: { tone: 'success', title: 'Mark voyage as complete?', description: 'This will finalise the trip log and trigger compliance checks.', confirmText: 'Complete' },
    render: (args) => (
        <PopConfirm {...args} icon={CheckIcon} onConfirm={() => {}}>
            <Button content="Mark complete" variant="secondary" />
        </PopConfirm>
    ),
}

export const AsyncConfirm: Story = {
    name: 'Async confirm (loading state)',
    render: () => (
        <PopConfirm
            tone="danger"
            title="Delete this vessel?"
            confirmText="Delete"
            icon={TrashIcon}
            onConfirm={() => new Promise((r) => setTimeout(r, 1500))}
        >
            <Button content="Delete" variant="danger" />
        </PopConfirm>
    ),
}

// Regression: PopConfirm anchored to an IconButton trigger. IconButton must
// forward its ref (Popover.Trigger asChild) or the popover never anchors/opens.
export const IconButtonTrigger: Story = {
    name: 'IconButton trigger',
    args: { title: 'Delete item?', description: 'This action cannot be undone.', confirmText: 'Delete', tone: 'danger' },
    render: (args) => (
        <PopConfirm {...args} icon={TrashIcon} onConfirm={() => {}}>
            <IconButton type="bordered" title="Delete" icon={TrashIcon} />
        </PopConfirm>
    ),
}
