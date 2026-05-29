import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import RadioGroup, { type RadioOption } from './RadioGroup'

const meta: Meta<typeof RadioGroup> = {
    title: 'Inputs/RadioGroup',
    component: RadioGroup,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Single-select radio group on `@radix-ui/react-radio-group`. Options support a secondary `description`, individual `disabled`, horizontal/vertical orientation, size presets, and form integration (name, required, errorMessage). Arrow-key roving focus comes from Radix.',
            },
        },
    },
    decorators: [(S) => <div className="w-80"><S /></div>],
}
export default meta
type Story = StoryObj<typeof RadioGroup>

const FREQ: RadioOption[] = [
    { value: 'realtime', label: 'Real-time', description: 'Notify me the moment something happens' },
    { value: 'daily',    label: 'Daily digest', description: 'One summary email each morning' },
    { value: 'weekly',   label: 'Weekly digest' },
    { value: 'off',      label: 'Off', disabled: true },
]

function Controlled(args: React.ComponentProps<typeof RadioGroup>) {
    const [v, setV] = useState<string | undefined>(args.value ?? 'daily')
    return <RadioGroup {...args} value={v} onChange={setV} />
}

export const Default: Story = {
    render: (a) => <Controlled {...a} />,
    args: { label: 'Notification frequency', name: 'freq', options: FREQ },
}

export const Horizontal: Story = {
    render: (a) => <Controlled {...a} />,
    args: {
        label: 'Density',
        name: 'density',
        orientation: 'horizontal',
        options: [
            { value: 'compact', label: 'Compact' },
            { value: 'cozy', label: 'Cozy' },
            { value: 'comfortable', label: 'Comfortable' },
        ],
    },
}

export const Sizes: Story = {
    render: () => (
        <div className="flex flex-col gap-6">
            {(['sm', 'md', 'lg'] as const).map((size) => (
                <RadioGroup
                    key={size}
                    label={`size="${size}"`}
                    name={`s-${size}`}
                    size={size}
                    defaultValue="b"
                    options={[
                        { value: 'a', label: 'Option A' },
                        { value: 'b', label: 'Option B' },
                    ]}
                />
            ))}
        </div>
    ),
}

export const WithError: Story = {
    render: (a) => <Controlled {...a} />,
    args: {
        label: 'Plan',
        name: 'plan',
        value: undefined,
        required: true,
        errorMessage: 'Please choose a plan',
        options: [
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
        ],
    },
}
