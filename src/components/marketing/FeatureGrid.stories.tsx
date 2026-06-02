import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import FeatureGrid, { type Feature } from './FeatureGrid'

const meta: Meta<typeof FeatureGrid> = {
    title: 'Marketing/FeatureGrid',
    component: FeatureGrid,
    parameters: { layout: 'fullscreen' },
    argTypes: {
        columns: { control: 'inline-radio', options: [2, 3, 4] },
        centeredHeader: { control: 'boolean' },
    },
    decorators: [(Story) => <div className="mx-auto max-w-6xl p-8"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof FeatureGrid>

const I = ({ d }: { d: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>
)

const features: Feature[] = [
    { icon: <I d="M13 2 3 14h7v8l10-12h-7z" />, title: 'Real-time data', description: 'Live AIS, fuel and emissions streamed straight to the bridge.' },
    { icon: <I d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20" />, title: 'Global fleet', description: 'Track every vessel across every region from one screen.' },
    { icon: <I d="M3 3v18h18M7 14l4-4 4 4 5-6" />, title: 'Performance', description: 'Benchmark voyages and spot drift before it costs you.' },
    { icon: <I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, title: 'Compliance', description: 'CII, AER and EU-ETS reporting handled automatically.' },
    { icon: <I d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />, title: 'Collaboration', description: 'Shared threads keep ship and shore in sync.' },
    { icon: <I d="M12 2v4m0 12v4m10-10h-4M6 12H2" />, title: 'Extensible', description: 'A token-driven design system you can make your own.' },
]

export const Default: Story = {
    args: {
        eyebrow: 'Platform',
        title: 'Everything in one portal',
        description: 'The building blocks maritime operations teams reach for every day.',
        columns: 3,
        features,
    },
}

export const FourColumns: Story = {
    args: { title: 'Why teams choose us', columns: 4, features },
}

export const NoHeader: Story = {
    args: { columns: 3, features },
}
