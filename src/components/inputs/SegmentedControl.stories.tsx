import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import SegmentedControl from './SegmentedControl'

const meta: Meta<typeof SegmentedControl> = {
    title: 'Inputs/SegmentedControl',
    component: SegmentedControl,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Text-first selector for 2-4 mutually exclusive options. The selected segment lifts onto a surface-white pill inside a tinted track (the macOS/iOS pattern). Built on Radix toggle-group for arrow-key roving focus.',
            },
        },
    },
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
        label: { control: 'text' },
        helperText: { control: 'text' },
        fullWidth: { control: 'boolean' },
        disabled: { control: 'boolean' },
        required: { control: 'boolean' },
        errorMessage: { control: 'text' },
    },
}
export default meta
type Story = StoryObj<typeof SegmentedControl>

const VIEWS = [
    { value: 'list', label: 'List' },
    { value: 'board', label: 'Board' },
    { value: 'calendar', label: 'Calendar' },
]

function Controlled(args: React.ComponentProps<typeof SegmentedControl>) {
    const [v, setV] = useState(args.defaultValue ?? 'list')
    return <SegmentedControl {...args} value={v} onChange={setV} />
}

export const Default: Story = { render: (a) => <Controlled {...a} />, args: { options: VIEWS } }

export const WithLabel: Story = {
    render: (a) => <Controlled {...a} />,
    args: { options: VIEWS, label: 'Default view', helperText: 'Choose how records open by default.' },
}

export const Sizes: Story = {
    render: () => (
        <div className="flex flex-col gap-4 items-start">
            {(['sm', 'md', 'lg'] as const).map((size) => (
                <SegmentedControl key={size} size={size} defaultValue="board" options={VIEWS} />
            ))}
        </div>
    ),
}

export const FullWidth: Story = {
    render: (a) => <div className="w-96"><Controlled {...a} /></div>,
    args: { options: VIEWS, fullWidth: true },
}

export const TwoOptions: Story = {
    render: (a) => <Controlled {...a} />,
    args: {
        defaultValue: 'monthly',
        options: [
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
        ],
    },
}
