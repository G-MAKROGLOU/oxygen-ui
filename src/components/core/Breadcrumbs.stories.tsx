import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Breadcrumbs from './Breadcrumbs'

const meta: Meta<typeof Breadcrumbs> = {
    title: 'Menu/Breadcrumbs',
    component: Breadcrumbs,
    parameters: { layout: 'centered' },
    argTypes: { maxItems: { control: { type: 'number' } } },
}
export default meta
type Story = StoryObj<typeof Breadcrumbs>

const Home = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" /></svg>

export const Default: Story = {
    render: () => (
        <Breadcrumbs
            items={[
                { label: 'Home', href: '#', icon: Home },
                { label: 'Fleet', href: '#' },
                { label: 'Vessels', href: '#' },
                { label: 'Aurora' },
            ]}
        />
    ),
}

export const SlashSeparator: Story = {
    render: () => (
        <Breadcrumbs
            separator={<span className="text-foreground-muted text-sm">/</span>}
            items={[
                { label: 'Docs', href: '#' },
                { label: 'Components', href: '#' },
                { label: 'Breadcrumbs' },
            ]}
        />
    ),
}

export const Collapsed: Story = {
    name: 'Collapsed (maxItems)',
    render: () => (
        <Breadcrumbs
            maxItems={3}
            items={[
                { label: 'Home', href: '#' },
                { label: 'Region', href: '#' },
                { label: 'Country', href: '#' },
                { label: 'Port', href: '#' },
                { label: 'Terminal', href: '#' },
                { label: 'Berth 12' },
            ]}
        />
    ),
}
