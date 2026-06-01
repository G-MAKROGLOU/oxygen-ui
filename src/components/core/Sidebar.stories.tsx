import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Sidebar from './Sidebar'
import type { SidebarSection } from './Sidebar'
import ThemeSwitch from './Switch'

const meta: Meta<typeof Sidebar> = {
    title: 'Menu/Sidebar',
    component: Sidebar,
    parameters: { layout: 'fullscreen' },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ height: '100vh', display: 'flex' }}>
                <Story />
                <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, opacity: 0.7 }}>
                        Main content area
                    </h2>
                    <p style={{ marginTop: 8, fontSize: 13, opacity: 0.5 }}>
                        Resizes as the sidebar expands and collapses.
                    </p>
                </main>
            </div>
        ),
    ],
}
export default meta
type Story = StoryObj<typeof Sidebar>

// ── Shared nav data ───────────────────────────────────────────────────────────

const NAV: SidebarSection[] = [
    {
        key: 'main',
        items: [
            {
                key: 'overview',
                isActive: true,
                label: 'Overview',
                icon: (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <rect x="2" y="2" width="7" height="7" rx="1" />
                        <rect x="11" y="2" width="7" height="7" rx="1" />
                        <rect x="2" y="11" width="7" height="7" rx="1" />
                        <rect x="11" y="11" width="7" height="7" rx="1" />
                    </svg>
                ),
            },
            {
                key: 'fleet',
                label: 'Fleet',
                badge: 3,
                icon: (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M3 13l2-6 5 2 5-2 2 6H3z" /><path d="M3 13l-.5 3h15l-.5-3" />
                    </svg>
                ),
            },
            {
                key: 'voyages',
                label: 'Voyages',
                icon: (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <circle cx="10" cy="10" r="8" /><path d="M10 2v8l4 4" />
                    </svg>
                ),
            },
            {
                key: 'reports',
                label: 'Reports',
                icon: (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M4 2h8l4 4v12H4V2z" /><path d="M12 2v4h4" /><path d="M7 9h6M7 12h6M7 15h4" />
                    </svg>
                ),
            },
        ],
    },
    {
        key: 'admin',
        title: 'Administration',
        items: [
            {
                key: 'users',
                label: 'Users',
                icon: (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <circle cx="10" cy="7" r="4" /><path d="M2 19c0-4 3.58-7 8-7s8 3 8 7" />
                    </svg>
                ),
            },
            {
                key: 'settings',
                label: 'Settings',
                icon: (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <circle cx="10" cy="10" r="3" />
                        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" />
                    </svg>
                ),
            },
        ],
    },
]

// ── Stories ───────────────────────────────────────────────────────────────────

function ControlledSidebar(props: Partial<React.ComponentProps<typeof Sidebar>>) {
    const [expanded, setExpanded] = useState(true)
    const [dark, setDark] = useState(false)
    return (
        <Sidebar
            {...props}
            sections={NAV}
            isExpanded={expanded}
            onToggle={() => setExpanded((e) => !e)}
            footer={
                <ThemeSwitch
                    checked={dark}
                    onChange={({ target }) => {
                        setDark(target.checked)
                        document.documentElement.classList.toggle('dark', target.checked)
                    }}
                />
            }
        />
    )
}

export const Expanded: Story = {
    render: () => <ControlledSidebar />,
}

function CollapsedSidebar() {
    const [expanded, setExpanded] = useState(false)
    return (
        <Sidebar
            sections={NAV}
            isExpanded={expanded}
            onToggle={() => setExpanded((e) => !e)}
        />
    )
}

export const Collapsed: Story = {
    render: () => <CollapsedSidebar />,
}

export const Interactive: Story = {
    render: () => <ControlledSidebar />,
    parameters: {
        docs: {
            description: { story: 'Toggle the sidebar with the chevron button. Watch the main area resize fluidly.' },
        },
    },
}
