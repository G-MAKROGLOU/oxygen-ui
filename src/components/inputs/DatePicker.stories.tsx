import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import DatePicker from './DatePicker'

const meta: Meta<typeof DatePicker> = {
    title: 'Inputs/DatePicker',
    component: DatePicker,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    args: { label: 'Report date', htmlFor: 'date' },
}
export default meta
type Story = StoryObj<typeof DatePicker>

function Controlled(args: React.ComponentProps<typeof DatePicker>) {
    const [d, setD] = useState<Date | null>(args.value ?? null)
    return <DatePicker {...args} value={d} onChange={setD} />
}

export const Default: Story = {
    render: (args) => <Controlled {...args} />,
}

export const Preselected: Story = {
    render: (args) => <Controlled {...args} />,
    args: { value: new Date() },
}

export const MaxToday: Story = {
    name: 'No future dates',
    render: (args) => <Controlled {...args} />,
    args: { max: new Date() },
    parameters: {
        docs: {
            description: {
                story:
                    'Pass `max={new Date()}` to disable all future dates. Useful for "as-of" or report inputs.',
            },
        },
    },
}

export const MinMaxRange: Story = {
    name: 'Bounded window',
    render: (args) => <Controlled {...args} />,
    args: {
        min: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        max: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        label: 'Last/this/next month',
    },
}

export const MondayStart: Story = {
    name: 'Week starts Monday',
    render: (args) => <Controlled {...args} />,
    args: { weekStartsOn: 1 },
}

export const CustomFormat: Story = {
    name: 'Custom display format',
    render: (args) => <Controlled {...args} />,
    args: {
        value: new Date(),
        format: (d) =>
            new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(d),
    },
    parameters: {
        docs: {
            description: {
                story:
                    'Override the trigger display with any function — typically `Intl.DateTimeFormat` for locale-aware output.',
            },
        },
    },
}

export const WithError: Story = {
    render: (args) => <Controlled {...args} />,
    args: { errorMessage: 'Report date is required' },
}

export const Disabled: Story = {
    render: (args) => <Controlled {...args} />,
    args: { disabled: true, value: new Date() },
}

export const VerticalLayout: Story = {
    render: (args) => <Controlled {...args} />,
    args: { layout: 'vertical' },
}
