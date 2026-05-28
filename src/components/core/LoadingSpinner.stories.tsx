import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import LoadingSpinner from './LoadingSpinner'
import Button from '../inputs/Button'

const meta: Meta<typeof LoadingSpinner> = {
    title: 'Feedback/LoadingSpinner',
    component: LoadingSpinner,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Two concentric arcs counter-rotating around a breathing centre dot, with an optional staggered letter reveal beneath. Portaled to `document.body` for the fullscreen variant so it always covers the real viewport. Inline variant for use inside cards, table rows, drawers, and empty states.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof LoadingSpinner>

// ─── 1. Toggle the fullscreen overlay ────────────────────────────────────────

export const Overlay: Story = {
    name: '1. Fullscreen overlay',
    parameters: {
        docs: {
            description: {
                story:
                    'Default mode — covers the viewport with a blurred backdrop and the spinner + caption centred. Use during page loads, route transitions, or critical async work.',
            },
        },
    },
    render: () => {
        function Demo() {
            const [open, setOpen] = useState(false)
            return (
                <div className="p-10 flex flex-col items-center gap-3">
                    <p className="text-sm text-foreground-secondary">
                        Click to show the overlay for 2.5 seconds.
                    </p>
                    <Button
                        content="Show overlay"
                        onClick={() => {
                            setOpen(true)
                            setTimeout(() => setOpen(false), 2500)
                        }}
                    />
                    {open && <LoadingSpinner prompt="Loading vessels…" />}
                </div>
            )
        }
        return <Demo />
    },
}

// ─── 2. Sizes ───────────────────────────────────────────────────────────────

export const Sizes: Story = {
    name: '2. Size variants',
    parameters: {
        docs: {
            description: {
                story:
                    'Three size presets — `sm` for inline use inside small surfaces, `md` for the default fullscreen overlay, `lg` for marquee loaders. All three rotate at the same speed so the visual rhythm is consistent across the system.',
            },
        },
    },
    render: () => (
        <div className="p-10 flex items-end justify-center gap-16">
            <div className="flex flex-col items-center gap-3">
                <LoadingSpinner inline size="sm" />
                <code className="text-xs text-foreground-muted">size="sm"</code>
            </div>
            <div className="flex flex-col items-center gap-3">
                <LoadingSpinner inline size="md" />
                <code className="text-xs text-foreground-muted">size="md"</code>
            </div>
            <div className="flex flex-col items-center gap-3">
                <LoadingSpinner inline size="lg" />
                <code className="text-xs text-foreground-muted">size="lg"</code>
            </div>
        </div>
    ),
}

// ─── 3. Inline mode with caption ────────────────────────────────────────────

export const InlineWithCaption: Story = {
    name: '3. Inline — with caption',
    parameters: {
        docs: {
            description: {
                story:
                    'Inline mode with a short caption. Use inside cards, drawers, and empty-state slots. No portal, no backdrop — renders at the call site.',
            },
        },
    },
    render: () => (
        <div className="p-10 flex justify-center">
            <div className="rounded-lg border border-border bg-surface p-10 w-80 flex flex-col items-center">
                <LoadingSpinner inline size="md" prompt="Loading" />
            </div>
        </div>
    ),
}

// ─── 4. Custom colour ───────────────────────────────────────────────────────

export const CustomColour: Story = {
    name: '4. Custom spinner colour',
    parameters: {
        docs: {
            description: {
                story:
                    '`spinnerColor` and `textColor` accept any CSS colour. Use to align the loader with a branded surface or to signal severity (e.g. green for save, amber for slow op).',
            },
        },
    },
    render: () => (
        <div className="p-10 grid grid-cols-3 gap-10 place-items-center">
            <LoadingSpinner inline size="md" spinnerColor="#10b981" />
            <LoadingSpinner inline size="md" spinnerColor="#f59e0b" />
            <LoadingSpinner inline size="md" spinnerColor="#ef4444" />
        </div>
    ),
}

// ─── 5. Inside a button ─────────────────────────────────────────────────────

export const InsideButton: Story = {
    name: '5. Tiny inline — inside a button',
    parameters: {
        docs: {
            description: {
                story:
                    "The `Button` component has its own `loading` prop; this story shows the spinner inline next to text when you need a custom loading affordance outside of `Button` — e.g. inside a chip or a row action.",
            },
        },
    },
    render: () => (
        <div className="p-10 flex justify-center gap-3">
            <div className="inline-flex items-center gap-2 bg-accent text-accent-fg rounded-lg px-4 py-2 text-sm">
                <LoadingSpinner inline size="sm" spinnerColor="currentColor" />
                Saving…
            </div>
        </div>
    ),
}
