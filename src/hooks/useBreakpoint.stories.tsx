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
