import React, { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Portal from './Portal'
import Button from '../inputs/Button'

const meta: Meta<typeof Portal> = {
    title: 'Layout/Portal',
    component: Portal,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'SSR-safe DOM relocator. Renders children at a detached node (defaults to `document.body`) so `position: fixed` descendants resolve against the real viewport, never a transformed/filtered/contained ancestor. Use it for any viewport-anchored UI — toasts, drawers, full-screen overlays, lightboxes. Components built on Radix primitives (Modal, Drawer, Tooltip, Dropdown) already do this via their own `*.Portal` and do not need to be wrapped.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof Portal>

// ─── 1. Basic ────────────────────────────────────────────────────────────────

export const Basic: Story = {
    name: '1. Basic — toggle a fixed overlay',
    parameters: {
        docs: {
            description: {
                story:
                    'The most common use: wrap a `position: fixed` overlay so it covers the real viewport. Click the trigger to render an overlay into `document.body`.',
            },
        },
    },
    render: () => {
        function Demo() {
            const [open, setOpen] = useState(false)
            return (
                <div className="p-10">
                    <Button content="Open overlay" onClick={() => setOpen(true)} />
                    {open && (
                        <Portal>
                            <div
                                className="fixed inset-0 z-[500000] flex items-center justify-center bg-backdrop"
                                onClick={() => setOpen(false)}
                            >
                                <div className="rounded-lg bg-surface p-6 shadow-xl max-w-sm" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-base font-semibold text-foreground">Portaled overlay</h3>
                                    <p className="mt-1 text-sm text-foreground-secondary">
                                        This element lives at <code className="font-mono text-xs">document.body</code>, so its{' '}
                                        <code className="font-mono text-xs">position: fixed</code> resolves against the actual viewport.
                                    </p>
                                    <div className="mt-4 flex justify-end">
                                        <Button content="Close" variant="secondary" onClick={() => setOpen(false)} />
                                    </div>
                                </div>
                            </div>
                        </Portal>
                    )}
                </div>
            )
        }
        return <Demo />
    },
}

// ─── 2. Failure mode side-by-side ────────────────────────────────────────────

export const BrokenWithoutPortal: Story = {
    name: '2. Without Portal — broken by transformed ancestor',
    parameters: {
        docs: {
            description: {
                story:
                    "A `position: fixed` element inside a wrapper with `transform` no longer covers the viewport — it covers only the wrapper's box. Open both this story and the next one to compare; this one's overlay only fills the bordered container.",
            },
        },
    },
    render: () => {
        function Demo() {
            const [open, setOpen] = useState(false)
            return (
                <div className="p-10">
                    <div className="rounded-lg border border-border p-6" style={{ transform: 'translateZ(0)' }}>
                        <p className="text-sm text-foreground-secondary mb-3">
                            This card has <code className="font-mono text-xs">transform: translateZ(0)</code> — a common
                            performance hint. It creates a new containing block for fixed descendants.
                        </p>
                        <Button content="Open overlay (no Portal)" onClick={() => setOpen(true)} />
                        {open && (
                            <div
                                className="fixed inset-0 z-[500000] flex items-center justify-center bg-status-error/60"
                                onClick={() => setOpen(false)}
                            >
                                <div className="rounded-lg bg-surface p-6 shadow-xl max-w-sm">
                                    <h3 className="text-base font-semibold text-foreground">Broken overlay</h3>
                                    <p className="mt-1 text-sm text-foreground-secondary">
                                        Only covers the card, not the viewport — the parent <code>transform</code> hijacked the containing block.
                                    </p>
                                    <Button content="Close" variant="secondary" onClick={() => setOpen(false)} className="mt-4" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
        return <Demo />
    },
}

export const FixedWithPortal: Story = {
    name: '3. With Portal — same wrapper, correct behaviour',
    parameters: {
        docs: {
            description: {
                story:
                    'Identical wrapper, but the overlay is wrapped in `<Portal>`. Now it covers the whole viewport regardless of the parent `transform`.',
            },
        },
    },
    render: () => {
        function Demo() {
            const [open, setOpen] = useState(false)
            return (
                <div className="p-10">
                    <div className="rounded-lg border border-border p-6" style={{ transform: 'translateZ(0)' }}>
                        <p className="text-sm text-foreground-secondary mb-3">
                            Same <code className="font-mono text-xs">transform: translateZ(0)</code> wrapper as the broken
                            story, but the overlay below escapes via <code>{'<Portal>'}</code>.
                        </p>
                        <Button content="Open overlay (with Portal)" onClick={() => setOpen(true)} />
                        {open && (
                            <Portal>
                                <div
                                    className="fixed inset-0 z-[500000] flex items-center justify-center bg-status-success/60"
                                    onClick={() => setOpen(false)}
                                >
                                    <div className="rounded-lg bg-surface p-6 shadow-xl max-w-sm">
                                        <h3 className="text-base font-semibold text-foreground">Correct overlay</h3>
                                        <p className="mt-1 text-sm text-foreground-secondary">
                                            Covers the entire viewport. The Portal escapes to <code>document.body</code>, so the parent{' '}
                                            <code>transform</code> can no longer hijack positioning.
                                        </p>
                                        <Button content="Close" variant="secondary" onClick={() => setOpen(false)} className="mt-4" />
                                    </div>
                                </div>
                            </Portal>
                        )}
                    </div>
                </div>
            )
        }
        return <Demo />
    },
}

// ─── 4. Custom target ────────────────────────────────────────────────────────

export const CustomTarget: Story = {
    name: '4. Custom target — mount into a specific node',
    parameters: {
        docs: {
            description: {
                story:
                    'Pass `target` to mount into a specific DOM node. Use a function form when the node is created during render and may not exist on the first paint.',
            },
        },
    },
    render: () => {
        function Demo() {
            const slotRef = useRef<HTMLDivElement | null>(null)
            const [count, setCount] = useState(0)
            return (
                <div className="p-10 space-y-4">
                    <div className="flex gap-3">
                        <Button content="Add badge" onClick={() => setCount((c) => c + 1)} />
                        <Button content="Reset" variant="secondary" onClick={() => setCount(0)} />
                    </div>
                    <div
                        ref={slotRef}
                        className="min-h-[80px] rounded-lg border border-dashed border-border p-3 flex flex-wrap gap-2 items-start bg-surface-raised/40"
                    >
                        <span className="text-xs font-mono text-foreground-muted">target slot →</span>
                    </div>
                    {Array.from({ length: count }).map((_, i) => (
                        <Portal key={i} target={() => slotRef.current!}>
                            <span className="rounded-full bg-status-info px-2 py-0.5 text-xs font-medium text-white">
                                badge {i + 1}
                            </span>
                        </Portal>
                    ))}
                </div>
            )
        }
        return <Demo />
    },
}

// ─── 5. Disabled / inline render ─────────────────────────────────────────────

export const Disabled: Story = {
    name: '5. Disabled — pass null to render nothing',
    parameters: {
        docs: {
            description: {
                story:
                    'Pass `target={null}` to disable the portal entirely. Useful for SSR-conditional rendering or for opting out at runtime without restructuring the tree.',
            },
        },
    },
    render: () => {
        function Demo() {
            const [enabled, setEnabled] = useState(true)
            return (
                <div className="p-10 space-y-4">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        Portal enabled
                    </label>
                    <p className="text-sm text-foreground-secondary">
                        When enabled, the toast below renders at <code>document.body</code>. When disabled, it renders nothing.
                    </p>
                    <Portal target={enabled ? undefined : null}>
                        <div className="fixed bottom-4 right-4 z-[500000] rounded-md bg-status-success p-3 text-sm text-white shadow-lg">
                            I am portaled into the body.
                        </div>
                    </Portal>
                </div>
            )
        }
        return <Demo />
    },
}
