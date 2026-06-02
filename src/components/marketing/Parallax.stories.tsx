import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Parallax from './Parallax'
import Button from '../inputs/Button'

const meta: Meta<typeof Parallax> = {
    title: 'Marketing/Parallax',
    component: Parallax,
    parameters: { layout: 'fullscreen' },
    argTypes: {
        speed: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
        overlay: { control: 'boolean' },
        height: { control: { type: 'number', step: 20 } },
    },
    decorators: [(Story) => (
        <div className="p-6">
            <div className="mb-6 rounded-xl border border-border bg-surface p-6 text-sm text-foreground-secondary">Scroll down — the band’s background drifts as it passes through the viewport.</div>
            <Story />
            <div className="mt-6 rounded-xl border border-border bg-surface p-6 text-sm text-foreground-secondary">Content after the band.</div>
        </div>
    )],
}
export default meta
type Story = StoryObj<typeof Parallax>

export const Default: Story = {
    args: {
        background: 'https://picsum.photos/seed/parallax1/1600/1000',
        height: 460,
        speed: 0.35,
        children: (
            <>
                <h2 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">Built for the open sea</h2>
                <p className="max-w-lg text-lg text-white/85">Maritime operations, calm and legible at any scale.</p>
                <div className="mt-2 flex gap-3"><Button content="Get started" /><Button variant="outline" content="Learn more" /></div>
            </>
        ),
    },
}

export const Subtle: Story = {
    args: {
        background: 'https://picsum.photos/seed/parallax2/1600/1000',
        height: 380,
        speed: 0.15,
        children: <h2 className="text-3xl font-bold text-white">A quieter drift</h2>,
    },
}

export const NoOverlay: Story = {
    args: {
        background: 'https://picsum.photos/seed/parallax3/1600/1000',
        height: 420,
        overlay: false,
        speed: 0.4,
        children: <span className="rounded-lg bg-surface/90 px-4 py-2 text-xl font-semibold text-foreground">Content over a clean image</span>,
    },
}
