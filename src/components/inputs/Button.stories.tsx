import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import Button from './Button'

const meta: Meta<typeof Button> = {
    title: 'Forms/Button',
    component: Button,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    args: {
        content: 'Click me',
        onClick: fn(), // captures clicks in the Actions panel
    },
}
export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
    args: { variant: 'primary', content: 'Save changes' },
}

export const Secondary: Story = {
    args: { variant: 'secondary', content: 'Cancel' },
}

export const Ghost: Story = {
    args: { variant: 'ghost', content: 'More options' },
}

export const Danger: Story = {
    args: { variant: 'danger', content: 'Delete' },
}

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-3">
            <Button size="sm" content="Small" />
            <Button size="md" content="Medium" />
            <Button size="lg" content="Large" />
        </div>
    ),
}

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-wrap gap-3">
            <Button variant="primary"   content="Primary" />
            <Button variant="secondary" content="Secondary" />
            <Button variant="ghost"     content="Ghost" />
            <Button variant="danger"    content="Danger" />
        </div>
    ),
}

export const Loading: Story = {
    args: { loading: true, content: 'Saving…' },
}

export const Disabled: Story = {
    args: { disabled: true, content: 'Unavailable' },
}

// ── Interaction tests (visible in the Storybook Interactions panel) ───────────

export const ClickFiresCallback: Story = {
    name: 'Interaction — click fires callback',
    args: { content: 'Click me', variant: 'primary' },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement)
        const btn = canvas.getByRole('button', { name: 'Click me' })
        await userEvent.click(btn)
        await expect(args.onClick).toHaveBeenCalledTimes(1)
    },
}

export const DisabledDoesNotFire: Story = {
    name: 'Interaction — disabled blocks click',
    args: { content: 'Unavailable', disabled: true },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement)
        const btn = canvas.getByRole('button', { name: 'Unavailable' })
        await expect(btn).toBeDisabled()
        await userEvent.click(btn, { pointerEventsCheck: 0 })
        await expect(args.onClick).not.toHaveBeenCalled()
    },
}

export const WithIcon: Story = {
    args: {
        content: 'Download',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
        ),
    },
}
