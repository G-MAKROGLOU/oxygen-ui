import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import AppShell from './AppShell'
import type { SidebarSection } from './Sidebar'
import TopBar from './TopBar'
import ThemeSwitch from './Switch'
import Button from '../inputs/Button'

const meta: Meta<typeof AppShell> = {
    title: 'Core/AppShell',
    component: AppShell,
    parameters: { layout: 'fullscreen' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof AppShell>

// ── Shared fixtures ───────────────────────────────────────────────────────────

const NAV: SidebarSection[] = [
    {
        key: 'main',
        items: [
            {
                key: 'overview', label: 'Overview', isActive: true,
                icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="7" height="7" rx="1" /><rect x="11" y="2" width="7" height="7" rx="1" /><rect x="2" y="11" width="7" height="7" rx="1" /><rect x="11" y="11" width="7" height="7" rx="1" /></svg>,
            },
            {
                key: 'fleet', label: 'Fleet', badge: 3,
                icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 13l2-6 5 2 5-2 2 6H3z" /><path d="M3 13l-.5 3h15l-.5-3" /></svg>,
            },
            {
                key: 'voyages', label: 'Voyages',
                icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="10" cy="10" r="8" /><path d="M10 2v8l4 4" /></svg>,
            },
        ],
    },
    {
        key: 'admin', title: 'Admin',
        items: [
            {
                key: 'settings', label: 'Settings',
                icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="10" cy="10" r="3" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" /></svg>,
            },
        ],
    },
]

function SampleContent() {
    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-foreground">Fleet Overview</h1>
                <p className="mt-1 text-sm text-foreground-secondary">Monitoring 24 active vessels across 6 regions.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'At Sea', value: '14' },
                    { label: 'In Port', value: '7' },
                    { label: 'Anchored', value: '3' },
                ].map((m) => (
                    <div key={m.label} className="rounded-lg border border-border bg-surface p-4">
                        <p className="text-xs text-foreground-muted uppercase tracking-wide">{m.label}</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">{m.value}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-sm font-medium text-foreground mb-3">Recent activity</p>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                        <p className="text-sm text-foreground-secondary">Vessel {String.fromCharCode(65 + i)} departed Rotterdam</p>
                        <p className="ml-auto text-xs text-foreground-muted">{i + 1}h ago</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Stories ───────────────────────────────────────────────────────────────────

function FullAppShell({ defaultExpanded = false }: { defaultExpanded?: boolean }) {
    const [dark, setDark] = useState(false)
    return (
        <AppShell
            topBar={
                <TopBar
                    brand={
                        <span className="font-bold text-sm tracking-tight text-foreground select-none">
                            Oxygen<span className="text-accent">UI</span>
                        </span>
                    }
                    actions={
                        <div className="flex items-center gap-3">
                            <ThemeSwitch
                                checked={dark}
                                onChange={({ target }) => {
                                    setDark(target.checked)
                                    document.documentElement.classList.toggle('dark', target.checked)
                                }}
                            />
                            <Button variant="primary" size="sm" content="New voyage" />
                        </div>
                    }
                />
            }
            sidebarSections={NAV}
            sidebarDefaultExpanded={defaultExpanded}
        >
            <SampleContent />
        </AppShell>
    )
}

export const CollapsedSidebar: Story = {
    render: () => <FullAppShell defaultExpanded={false} />,
}

export const ExpandedSidebar: Story = {
    render: () => <FullAppShell defaultExpanded={true} />,
}

export const NoSidebar: Story = {
    render: () => (
        <AppShell
            topBar={
                <TopBar
                    brand={<span className="font-bold text-sm text-foreground">OxygenUI</span>}
                    actions={<Button variant="secondary" size="sm" content="Sign out" />}
                />
            }
        >
            <SampleContent />
        </AppShell>
    ),
}
