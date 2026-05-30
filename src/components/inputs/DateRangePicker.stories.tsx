import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import DateRangePicker, { type DateRange } from './DateRangePicker'

const addDays = (d: Date, n: number) => { const c = new Date(d); c.setDate(c.getDate() + n); return c }

const meta: Meta<typeof DateRangePicker> = {
    title: 'Inputs/DateRangePicker',
    component: DateRangePicker,
    tags: ['autodocs'],
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
        label: { control: 'text' },
        placeholder: { control: 'text' },
        helperText: { control: 'text' },
        errorMessage: { control: 'text' },
        disabled: { control: 'boolean' },
        required: { control: 'boolean' },
    },
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Two-month range picker. Click a start date then an end date; the span highlights as you hover. Optional quick-select presets in a side rail.',
            },
        },
    },
    decorators: [(S) => <div className="w-80"><S /></div>],
}
export default meta
type Story = StoryObj<typeof DateRangePicker>

function Controlled(args: React.ComponentProps<typeof DateRangePicker>) {
    const [range, setRange] = useState<DateRange>(args.value ?? { start: null, end: null })
    return <DateRangePicker {...args} value={range} onChange={setRange} />
}

export const Default: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Reporting period' } }

export const WithPresets: Story = {
    render: (a) => <Controlled {...a} />,
    args: {
        label: 'Period',
        presets: [
            { label: 'Today', range: () => ({ start: new Date(), end: new Date() }) },
            { label: 'Last 7 days', range: () => ({ start: addDays(new Date(), -6), end: new Date() }) },
            { label: 'Last 30 days', range: () => ({ start: addDays(new Date(), -29), end: new Date() }) },
            { label: 'This month', range: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth(), 1), end: n } } },
        ],
    },
}

export const WithError: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Period', errorMessage: 'Select a range' } }
