import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Switch from './Switch'

const meta: Meta<typeof Switch> = {
    title: 'Inputs/Switch',
    component: Switch,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    argTypes: {
        layout: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
        label: { control: 'text' },
        offLabel: { control: 'text' },
        onLabel: { control: 'text' },
        helperText: { control: 'text' },
        disabled: { control: 'boolean' },
        required: { control: 'boolean' },
        errorMessage: { control: 'text' },
    },
}
export default meta
type Story = StoryObj<typeof Switch>

function Controlled(args: React.ComponentProps<typeof Switch>) {
    const [on, setOn] = useState(args.checked ?? false)
    return <Switch {...args} checked={on} onChange={(e) => setOn(e.target.checked)} />
}

export const Off: Story = { render: (a) => <Controlled {...a} /> }
export const On:  Story = { render: (a) => <Controlled {...a} />, args: { checked: true } }

export const WithLabel: Story = {
    render: (a) => <Controlled {...a} />,
    args: { label: 'Email notifications', helperText: 'We will only email you about account activity.' },
}

export const PerStateLabels: Story = {
    name: 'Per-state labels',
    render: (a) => <Controlled {...a} />,
    args: { offLabel: 'Monthly', onLabel: 'Yearly' },
    parameters: {
        docs: { description: { story: '`offLabel` / `onLabel` flank the track and emphasise the active state — the "Monthly ▮ Yearly" pattern.' } },
    },
}

export const WithError: Story = {
    render: (a) => <Controlled {...a} />,
    args: { label: 'Accept terms', required: true, errorMessage: 'You must enable this to continue' },
}

const Check = (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-foreground" aria-hidden="true">
        <path d="M13.854 3.854a.5.5 0 0 0-.708-.708L6 10.293 2.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7.5-7.5z" />
    </svg>
)
const Cross = (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-foreground" aria-hidden="true">
        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854z" />
    </svg>
)

export const WithIcons: Story = {
    render: (a) => <Controlled {...a} />,
    args: { checkedIcon: Check, uncheckedIcon: Cross },
}
