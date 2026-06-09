import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useBreakpoint } from './useMediaQuery'
import Badge from '../components/core/Badge'

const meta: Meta = {
    title: 'Hooks/useBreakpoint',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

export const Demo: Story = {
    name: 'Active breakpoint',
    render: () => {
        const Example = () => {
            const bp = useBreakpoint()
            const row = (label: string, on: boolean) => (
                <div className="flex items-center justify-between gap-8">
                    <span className="text-sm text-foreground-secondary">{label}</span>
                    <Badge tone={on ? 'success' : 'neutral'} variant="soft">{on ? 'true' : 'false'}</Badge>
                </div>
            )
            return (
                <div style={{ width: 320 }} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">active</span>
                        <Badge tone="accent" variant="solid">{bp.active}</Badge>
                    </div>
                    {row('sm ≥ 480', bp.sm)}
                    {row('md ≥ 768', bp.md)}
                    {row('lg ≥ 976', bp.lg)}
                    {row('xl ≥ 1440', bp.xl)}
                    <p className="mt-1 text-xs text-foreground-muted">Resize the Storybook viewport to watch these flip.</p>
                </div>
            )
        }
        return <Example />
    },
}

export const Playground: Story = {
    args: { highlight: 'active' },
    argTypes: { highlight: { control: 'inline-radio', options: ['active', 'sm', 'md', 'lg', 'xl'] } },
    render: (args: { highlight: 'active' | 'sm' | 'md' | 'lg' | 'xl' }) => {
        const Demo = () => {
            const bp = useBreakpoint()
            return (
                <div className="flex flex-col items-center gap-2">
                    <div className="text-sm text-foreground">active: <strong className="text-accent">{bp.active}</strong></div>
                    <div className="flex gap-1.5">
                        {(['sm', 'md', 'lg', 'xl'] as const).map((k) => {
                            const on = args.highlight === k || (args.highlight === 'active' && bp.active === k)
                            return <Badge key={k} tone={on ? 'accent' : bp[k] ? 'success' : 'neutral'} variant="soft">{k}: {String(bp[k])}</Badge>
                        })}
                    </div>
                </div>
            )
        }
        return <Demo />
    },
}
