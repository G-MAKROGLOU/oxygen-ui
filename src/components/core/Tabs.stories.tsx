import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Tabs from './Tabs'

const meta: Meta<typeof Tabs> = {
    title: 'Data Display/Tabs',
    component: Tabs,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    "Compositional, motion-forward tabs on Radix Tabs. The active tab is marked by a thin cobalt indicator that slides between tabs (the design system's one-rare-accent rule), not a full-fill pill. Variants: `underline` (signature), `segmented` (lifted-pill track), `enclosed` (folder tabs). Supports horizontal/vertical orientation, icons, count badges, closeable + add-tab, and overflow scrolling with chevrons that appear only when the strip overflows. Compose with `Tabs.List` / `Tabs.Trigger` / `Tabs.Panel` / `Tabs.Add`.",
            },
        },
    },
    argTypes: {
        variant: { control: 'inline-radio', options: ['underline', 'segmented', 'enclosed'] },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    },
}
export default meta
type Story = StoryObj<typeof Tabs>

// ── Icons ─────────────────────────────────────────────────────────────────────
const I = {
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M3 11l9-8 9 8M5 10v10h14V10" /></svg>,
    bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" /></svg>,
    cog: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7.7 1.6 1.6 0 01-3.2 0 1.6 1.6 0 00-2.7-.7l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00-1-2.7 1.6 1.6 0 010-3.2 1.6 1.6 0 001-2.7l-.1-.1A2 2 0 117.7 4.3l.1.1a1.6 1.6 0 002.7-.7 1.6 1.6 0 013.2 0 1.6 1.6 0 002.7.7l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00.7 2.7 1.6 1.6 0 010 3.2 1.6 1.6 0 00-1 .9z" /></svg>,
}

const Panel = ({ title, children }: { title: string; children?: React.ReactNode }) => (
    <div className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-foreground-secondary">{children ?? 'Panel content goes here. The strip stays flat; the panel is a calm reading surface below it.'}</p>
    </div>
)

// ── 1. Underline (signature) ─────────────────────────────────────────────────
export const Underline: Story = {
    render: (args) => (
        <div className="w-[560px] max-w-full">
            <Tabs defaultValue="overview" variant={args.variant ?? 'underline'} size={args.size} orientation={args.orientation}>
                <Tabs.List aria-label="Sections">
                    <Tabs.Trigger value="overview" icon={I.home}>Overview</Tabs.Trigger>
                    <Tabs.Trigger value="activity" badge={12}>Activity</Tabs.Trigger>
                    <Tabs.Trigger value="settings" icon={I.cog}>Settings</Tabs.Trigger>
                    <Tabs.Trigger value="disabled" disabled>Archived</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Panel value="overview"><Panel title="Overview" /></Tabs.Panel>
                <Tabs.Panel value="activity"><Panel title="Activity">12 new events since your last visit.</Panel></Tabs.Panel>
                <Tabs.Panel value="settings"><Panel title="Settings" /></Tabs.Panel>
                <Tabs.Panel value="disabled"><Panel title="Archived" /></Tabs.Panel>
            </Tabs>
        </div>
    ),
}

// ── 2. Segmented ──────────────────────────────────────────────────────────────
export const Segmented: Story = {
    render: () => (
        <div className="w-[560px] max-w-full">
            <Tabs defaultValue="day" variant="segmented">
                <Tabs.List aria-label="Range">
                    <Tabs.Trigger value="day">Day</Tabs.Trigger>
                    <Tabs.Trigger value="week">Week</Tabs.Trigger>
                    <Tabs.Trigger value="month">Month</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Panel value="day"><Panel title="Day" /></Tabs.Panel>
                <Tabs.Panel value="week"><Panel title="Week" /></Tabs.Panel>
                <Tabs.Panel value="month"><Panel title="Month" /></Tabs.Panel>
            </Tabs>
        </div>
    ),
}

// ── 3. Enclosed (folder) ──────────────────────────────────────────────────────
export const Enclosed: Story = {
    render: () => (
        <div className="w-[560px] max-w-full">
            <Tabs defaultValue="editor" variant="enclosed">
                <Tabs.List aria-label="Workspace">
                    <Tabs.Trigger value="editor" icon={I.home}>Editor</Tabs.Trigger>
                    <Tabs.Trigger value="preview" icon={I.bell} badge={3}>Preview</Tabs.Trigger>
                    <Tabs.Trigger value="config" icon={I.cog}>Config</Tabs.Trigger>
                </Tabs.List>
                <div className="rounded-b-lg border border-t-0 border-border bg-surface p-5">
                    <Tabs.Panel value="editor"><span className="text-sm text-foreground-secondary">Editor pane.</span></Tabs.Panel>
                    <Tabs.Panel value="preview"><span className="text-sm text-foreground-secondary">Preview pane.</span></Tabs.Panel>
                    <Tabs.Panel value="config"><span className="text-sm text-foreground-secondary">Config pane.</span></Tabs.Panel>
                </div>
            </Tabs>
        </div>
    ),
    parameters: { docs: { description: { story: 'Enclosed tabs connect into the panel: the active folder tab is a raised surface that joins the bordered pane below.' } } },
}

// ── 4. Sizes ──────────────────────────────────────────────────────────────────
export const Sizes: Story = {
    render: () => (
        <div className="flex flex-col gap-8 w-[480px] max-w-full">
            {(['sm', 'md', 'lg'] as const).map((size) => (
                <Tabs key={size} defaultValue="a" size={size}>
                    <Tabs.List aria-label={`size ${size}`}>
                        <Tabs.Trigger value="a">size=&quot;{size}&quot;</Tabs.Trigger>
                        <Tabs.Trigger value="b">Second</Tabs.Trigger>
                        <Tabs.Trigger value="c">Third</Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Panel value="a"><div className="pt-3 text-sm text-foreground-secondary">Content.</div></Tabs.Panel>
                    <Tabs.Panel value="b"><div className="pt-3 text-sm text-foreground-secondary">Content.</div></Tabs.Panel>
                    <Tabs.Panel value="c"><div className="pt-3 text-sm text-foreground-secondary">Content.</div></Tabs.Panel>
                </Tabs>
            ))}
        </div>
    ),
}

// ── 5. Vertical ───────────────────────────────────────────────────────────────
export const Vertical: Story = {
    render: () => (
        <div className="w-[560px] max-w-full">
            <Tabs defaultValue="profile" orientation="vertical">
                <Tabs.List aria-label="Account">
                    <Tabs.Trigger value="profile" icon={I.home}>Profile</Tabs.Trigger>
                    <Tabs.Trigger value="alerts" icon={I.bell} badge={5}>Alerts</Tabs.Trigger>
                    <Tabs.Trigger value="prefs" icon={I.cog}>Preferences</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Panel value="profile"><Panel title="Profile" /></Tabs.Panel>
                <Tabs.Panel value="alerts"><Panel title="Alerts">5 unread.</Panel></Tabs.Panel>
                <Tabs.Panel value="prefs"><Panel title="Preferences" /></Tabs.Panel>
            </Tabs>
        </div>
    ),
}

// ── 6. Dynamic: closeable + add ───────────────────────────────────────────────
export const Dynamic: Story = {
    name: 'Closeable + add (dynamic)',
    render: () => {
        function Demo() {
            const [tabs, setTabs] = useState([
                { key: 't1', title: 'Aurora' },
                { key: 't2', title: 'Beacon' },
                { key: 't3', title: 'Catalina' },
            ])
            const [active, setActive] = useState('t1')
            const [seq, setSeq] = useState(4)

            const close = (key: string) => {
                setTabs((prev) => {
                    const next = prev.filter((t) => t.key !== key)
                    if (key === active && next.length) setActive(next[next.length - 1].key)
                    return next
                })
            }
            const add = () => {
                const key = `t${seq}`
                setTabs((prev) => [...prev, { key, title: `Vessel ${seq}` }])
                setActive(key)
                setSeq((s) => s + 1)
            }

            return (
                <div className="w-[560px] max-w-full">
                    <Tabs value={active} onChange={setActive}>
                        <Tabs.List aria-label="Open vessels">
                            {tabs.map((t) => (
                                <Tabs.Trigger key={t.key} value={t.key} closeable onClose={() => close(t.key)}>
                                    {t.title}
                                </Tabs.Trigger>
                            ))}
                            <Tabs.Add onClick={add} />
                        </Tabs.List>
                        {tabs.map((t) => (
                            <Tabs.Panel key={t.key} value={t.key}><Panel title={t.title} /></Tabs.Panel>
                        ))}
                    </Tabs>
                </div>
            )
        }
        return <Demo />
    },
}

// ── 7. Overflow ───────────────────────────────────────────────────────────────
export const Overflow: Story = {
    render: () => (
        <div className="w-[420px] max-w-full">
            <Tabs defaultValue="s1">
                <Tabs.List aria-label="Many sections">
                    {Array.from({ length: 10 }, (_, i) => (
                        <Tabs.Trigger key={i} value={`s${i + 1}`}>Section {i + 1}</Tabs.Trigger>
                    ))}
                </Tabs.List>
                {Array.from({ length: 10 }, (_, i) => (
                    <Tabs.Panel key={i} value={`s${i + 1}`}><div className="pt-3 text-sm text-foreground-secondary">Section {i + 1} content.</div></Tabs.Panel>
                ))}
            </Tabs>
        </div>
    ),
    parameters: { docs: { description: { story: 'When the strip overflows, it scrolls (drag / wheel / swipe), the edges fade, and prev/next chevrons appear only on the overflowing side. A "Show all tabs" menu (⋯) also appears, hover or click it to jump straight to any tab; the picked tab scrolls into view.' } } },
}

export const Playground: Story = {
    args: { variant: 'underline', size: 'md', orientation: 'horizontal' },
    argTypes: {
        variant: { control: 'inline-radio', options: ['underline', 'segmented', 'enclosed'] },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    },
    render: (args) => (
        <Tabs defaultValue="overview" variant={args.variant} size={args.size} orientation={args.orientation}>
            <Tabs.List aria-label="Sections">
                <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
                <Tabs.Trigger value="activity" badge={12}>Activity</Tabs.Trigger>
                <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="overview"><div className="p-4 text-sm text-foreground-secondary">Overview panel</div></Tabs.Panel>
            <Tabs.Panel value="activity"><div className="p-4 text-sm text-foreground-secondary">Activity panel</div></Tabs.Panel>
            <Tabs.Panel value="settings"><div className="p-4 text-sm text-foreground-secondary">Settings panel</div></Tabs.Panel>
        </Tabs>
    ),
}
