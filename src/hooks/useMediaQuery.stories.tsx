import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMediaQuery, useBreakpoint } from './useMediaQuery'
import Badge from '../components/core/Badge'

const meta: Meta = {
    title: 'Hooks/useMediaQuery',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

export const Demo: Story = {
    name: 'Live breakpoints',
    render: () => {
        const Example = () => {
            const bp = useBreakpoint()
            const dark = useMediaQuery('(prefers-color-scheme: dark)')
            const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
            const flag = (label: string, on: boolean) => (
                <div className="flex items-center justify-between gap-6">
                    <span className="text-sm text-foreground-secondary">{label}</span>
                    <Badge tone={on ? 'success' : 'neutral'} variant="soft">{on ? 'true' : 'false'}</Badge>
                </div>
            )
            return (
                <div style={{ width: 340 }} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">Active breakpoint</span>
                        <Badge tone="accent" variant="solid">{bp.active}</Badge>
                    </div>
                    {flag('sm ≥ 480', bp.sm)}
                    {flag('md ≥ 768', bp.md)}
                    {flag('lg ≥ 976', bp.lg)}
                    {flag('xl ≥ 1440', bp.xl)}
                    <div className="my-1 h-px bg-border" />
                    {flag('prefers dark', dark)}
                    {flag('reduced motion', reduced)}
                    <p className="mt-1 text-xs text-foreground-muted">Drag the Storybook viewport / window to watch these update.</p>
                </div>
            )
        }
        return <Example />
    },
}
