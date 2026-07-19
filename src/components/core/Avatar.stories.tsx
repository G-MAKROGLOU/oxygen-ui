import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Avatar from './Avatar'

const meta: Meta<typeof Avatar> = {
    title: 'Data Display/Avatar',
    component: Avatar,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Circular or rounded-square user avatar built on `@radix-ui/react-avatar`. Tries to load the supplied `src`; falls back to either explicit `fallback` content, two-letter initials extracted from `alt`, or a generic silhouette, in that order. Optional `status` adds a presence dot.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof Avatar>

const PHOTO = 'https://i.pravatar.cc/120?img=12'

export const Default: Story = {
    name: 'With image',
    args: { src: PHOTO, alt: 'Jane Doe' },
}

export const Sizes: Story = {
    render: () => (
        <div className="flex items-end gap-4">
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                    <Avatar src={PHOTO} alt="Jane Doe" size={s} />
                    <code className="text-xs text-foreground-muted">size="{s}"</code>
                </div>
            ))}
        </div>
    ),
}

export const InitialsFallback: Story = {
    name: 'Initials fallback (no src)',
    parameters: {
        docs: {
            description: {
                story:
                    'When no `src` is provided, two-letter initials are extracted from `alt`. Works for any locale that uses whitespace-separated names.',
            },
        },
    },
    args: { alt: 'Jane Doe', size: 'lg' },
}

export const CustomFallback: Story = {
    args: {
        size: 'lg',
        fallback: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" fill="none" strokeWidth="2" />
            </svg>
        ),
    },
}

export const Square: Story = {
    args: { src: PHOTO, alt: 'Jane Doe', size: 'lg', shape: 'square' },
}

export const WithStatus: Story = {
    name: 'Presence dot',
    render: () => (
        <div className="flex items-end gap-4">
            {(['online', 'away', 'busy', 'offline'] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                    <Avatar src={PHOTO} alt="Jane Doe" size="lg" status={s} />
                    <code className="text-xs text-foreground-muted">status="{s}"</code>
                </div>
            ))}
        </div>
    ),
}

export const BrokenImage: Story = {
    name: 'Image fails to load → fallback',
    parameters: {
        docs: {
            description: {
                story:
                    'A 404 image URL, after Radix\'s short load delay, the fallback (initials) renders. Useful for guarding against stale CDN URLs.',
            },
        },
    },
    args: { src: 'https://example.invalid/missing.png', alt: 'Jane Doe', size: 'lg' },
}
