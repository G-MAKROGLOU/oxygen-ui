import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Statistic from './Statistic'
import Card from './Card'

const meta: Meta<typeof Statistic> = {
    title: 'Data Display/Statistic',
    component: Statistic,
    parameters: { layout: 'centered' },
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        align: { control: 'inline-radio', options: ['left', 'center'] },
    },
}
export default meta
type Story = StoryObj<typeof Statistic>

const Dollar = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M16 7H10a3 3 0 000 6h4a3 3 0 010 6H8" /></svg>

export const Default: Story = {
    args: {
        label: 'Revenue',
        value: '48,210',
        prefix: '$',
        delta: { value: '12%', direction: 'up', label: 'vs last month' },
    },
}

export const NegativeIsGood: Story = {
    name: 'Inverted (rise = bad)',
    args: {
        label: 'Churn rate',
        value: '3.1',
        suffix: '%',
        delta: { value: '0.4pt', direction: 'up', positiveIsGood: false, label: 'vs last quarter' },
    },
}

export const Grid: Story = {
    render: () => (
        <div className="grid grid-cols-2 gap-4" style={{ width: 560 }}>
            <Card padding="md"><Statistic icon={Dollar} label="Revenue" value="48,210" prefix="$" delta={{ value: '12%', direction: 'up' }} /></Card>
            <Card padding="md"><Statistic label="Active users" value="9,402" delta={{ value: '3%', direction: 'down' }} /></Card>
            <Card padding="md"><Statistic label="Uptime" value="99.98" suffix="%" delta={{ value: '0', direction: 'neutral' }} /></Card>
            <Card padding="md"><Statistic label="Avg. latency" value="128" suffix="ms" delta={{ value: '18ms', direction: 'down', positiveIsGood: false }} /></Card>
        </div>
    ),
}
