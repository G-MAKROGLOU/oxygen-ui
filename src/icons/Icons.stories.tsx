import React, { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Icon from './icons'
import { createIcon, type IconComponent } from './createIcon'

const meta: Meta = {
    title: 'Icons/Gallery',
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj

/* ── Catalog, grouped (canonical names; aliases listed in the guide) ─────── */
const GROUPS: { label: string; names: string[] }[] = [
    { label: 'Navigation', names: ['ChevronUp', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronsLeft', 'ChevronsRight', 'CaretUp', 'CaretDown', 'CaretLeft', 'CaretRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Menu', 'DotsHorizontal', 'DotsVertical', 'ExternalLink'] },
    { label: 'Actions', names: ['X', 'XCircle', 'Plus', 'PlusCircle', 'Minus', 'MinusCircle', 'Check', 'CheckCircle', 'Search', 'Edit', 'Trash', 'Copy', 'Clipboard', 'Download', 'Upload', 'Save', 'Filter', 'Sort', 'Refresh', 'Share', 'Print', 'Settings', 'Sliders', 'Maximize', 'Minimize'] },
    { label: 'Status & feedback', names: ['Info', 'Warning', 'Error', 'Question', 'Ban', 'Bell'] },
    { label: 'Media', names: ['Play', 'Pause', 'Stop', 'VolumeUp', 'VolumeOff', 'Image', 'Video', 'Camera', 'Microphone'] },
    { label: 'Communication', names: ['Mail', 'Chat', 'Phone', 'Send'] },
    { label: 'People & places', names: ['User', 'Users', 'Home', 'Globe', 'MapPin', 'Calendar', 'Clock'] },
    { label: 'Files & data', names: ['Document', 'File', 'Folder', 'Database', 'Grid', 'List', 'Table', 'ChartBar', 'PieChart', 'TrendingUp', 'TrendingDown', 'Calculator'] },
    { label: 'Security & favourites', names: ['Lock', 'Unlock', 'Key', 'Shield', 'ShieldCheck', 'Star', 'StarFilled', 'Heart', 'Bookmark', 'Tag', 'Link', 'Eye', 'EyeSlash'] },
    { label: 'Decoration', names: ['Bolt', 'Sparkles'] },
    { label: 'Theme & session', names: ['Sun', 'Moon', 'Spinner', 'Login', 'Logout', 'Power'] },
]

const ns = Icon as unknown as Record<string, IconComponent>
const TOTAL = GROUPS.reduce((n, g) => n + g.names.length, 0)

function Cell({ name }: { name: string }) {
    const Glyph = ns[name]
    const [copied, setCopied] = useState(false)
    if (!Glyph) return null
    const copy = () => {
        try { void navigator.clipboard?.writeText(`<Icon.${name} />`) } catch { /* ignore */ }
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1000)
    }
    return (
        <button
            type="button"
            onClick={copy}
            title={`Click to copy <Icon.${name} />`}
            className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-3 text-foreground-secondary transition-colors hover:border-border-strong hover:bg-surface-raised hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
            <Glyph size={26} className={name === 'Spinner' ? 'animate-spin' : undefined} />
            <span className="max-w-full truncate text-[11px] text-foreground-muted group-hover:text-foreground">{copied ? 'Copied!' : name}</span>
        </button>
    )
}

export const Gallery: Story = {
    render: () => {
        const [q, setQ] = useState('')
        const query = q.trim().toLowerCase()
        const groups = useMemo(
            () => GROUPS.map((g) => ({ ...g, names: query ? g.names.filter((n) => n.toLowerCase().includes(query)) : g.names })).filter((g) => g.names.length > 0),
            [query],
        )
        const shown = groups.reduce((n, g) => n + g.names.length, 0)
        return (
            <div className="mx-auto max-w-5xl p-6">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Icons</h1>
                        <p className="text-sm text-foreground-secondary">{TOTAL} icons · colour with <code className="text-accent">currentColor</code> · click any to copy its usage.</p>
                    </div>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={`Search ${TOTAL} icons…`}
                        aria-label="Search icons"
                        className="h-9 w-56 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none placeholder:text-foreground-muted focus:border-accent"
                    />
                </div>
                {groups.map((g) => (
                    <section key={g.label} className="mb-8">
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">{g.label}</h2>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
                            {g.names.map((n) => <Cell key={n} name={n} />)}
                        </div>
                    </section>
                ))}
                {shown === 0 && <p className="text-sm text-foreground-muted">No icons match “{q}”.</p>}
            </div>
        )
    },
}

export const Usage: Story = {
    name: 'Sizing & colour',
    render: () => (
        <div className="mx-auto max-w-3xl space-y-8 p-6">
            <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">Sizes (px)</h2>
                <div className="flex items-end gap-6 text-foreground">
                    {[16, 20, 24, 32, 48].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <Icon.Bell size={s} />
                            <span className="text-[11px] text-foreground-muted">{s}</span>
                        </div>
                    ))}
                </div>
            </section>
            <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">Colour follows text (currentColor)</h2>
                <div className="flex items-center gap-6">
                    <Icon.Heart size={28} className="text-foreground" />
                    <Icon.Heart size={28} className="text-accent" />
                    <Icon.Heart size={28} className="text-status-success" />
                    <Icon.Heart size={28} className="text-status-warning" />
                    <Icon.Heart size={28} className="text-status-error" />
                    <span className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-accent-fg"><Icon.Check size={18} /> Inherits on any surface</span>
                </div>
            </section>
            <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">Stroke weight</h2>
                <div className="flex items-center gap-6 text-foreground">
                    {[1, 1.5, 2, 2.5].map((w) => (
                        <div key={w} className="flex flex-col items-center gap-2">
                            <Icon.Settings size={30} strokeWidth={w} />
                            <span className="text-[11px] text-foreground-muted">{w}</span>
                        </div>
                    ))}
                </div>
            </section>
            <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted">In a sentence</h2>
                <p className="flex items-center gap-1.5 text-sm text-foreground-secondary">
                    Press <Icon.Search size={16} className="text-foreground" /> to search, then <Icon.Filter size={16} className="text-foreground" /> to refine.
                </p>
            </section>
        </div>
    ),
}

// A custom icon built with createIcon — matches the built-ins exactly.
const Anchor = createIcon('Anchor', <path d="M12 21V8m0 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 4a7 7 0 0 0 14 0M3 11h4m10 0h4" />)
const Rocket = createIcon('Rocket', <path d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.63 8.41m5.96 5.96-5.96-5.96m-2.58 5.84a6 6 0 0 0-7.38 5.84h4.8m2.58-5.84-2.58-2.58m0 0L4.5 12" />)

export const Extending: Story = {
    render: () => (
        <div className="mx-auto max-w-2xl space-y-5 p-6">
            <div>
                <h2 className="text-lg font-bold text-foreground">Extend the pack</h2>
                <p className="text-sm text-foreground-secondary">Wrap a path in <code className="text-accent">createIcon</code> and it behaves exactly like a built-in — same sizing, colour, and a11y.</p>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 text-xs leading-relaxed text-foreground-secondary"><code>{`import { createIcon } from '@geomak/ui'

const Anchor = createIcon('Anchor',
  <path d="M12 21V8m0 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 4a7 7 0 0 0 14 0M3 11h4m10 0h4" />)

<Anchor size={32} className="text-accent" title="Anchor" />`}</code></pre>
            <div className="flex items-center gap-6 text-accent">
                <Anchor size={36} title="Anchor" />
                <Rocket size={36} title="Rocket" />
                <Anchor size={28} className="text-status-success" />
                <Rocket size={28} className="text-foreground" />
            </div>
        </div>
    ),
}
