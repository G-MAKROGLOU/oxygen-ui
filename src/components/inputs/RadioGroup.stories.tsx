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
    argTypes: {
        layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
        labelPosition: { control: 'inline-radio', options: ['right', 'left'] },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        disabled: { control: 'boolean' },
        required: { control: 'boolean' },
        label: { control: 'text' },
        errorMessage: { control: 'text' },
    },
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
        layout: 'horizontal',
        options: [
            { value: 'compact', label: 'Compact' },
            { value: 'cozy', label: 'Cozy' },
            { value: 'comfortable', label: 'Comfortable' },
        ],
    },
}

export const LabelLeft: Story = {
    name: 'Label on the left',
    render: (a) => <Controlled {...a} />,
    args: {
        label: 'Alignment',
        name: 'align',
        labelPosition: 'left',
        options: [
            { value: 'a', label: 'Option A', description: 'Label sits left of the dot' },
            { value: 'b', label: 'Option B' },
        ],
    },
    parameters: {
        docs: {
            description: {
                story: '`labelPosition="left"` renders each label before its radio dot (useful in right-aligned settings columns).',
            },
        },
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
