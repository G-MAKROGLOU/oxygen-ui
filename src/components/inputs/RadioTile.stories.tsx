import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import RadioTile from './RadioTile'
import Icon from '../../icons/icons'

const meta: Meta<typeof RadioTile> = {
    title: 'Inputs/RadioTile',
    component: RadioTile,
    parameters: { layout: 'padded' },
    argTypes: {
        columns: { control: 'inline-radio', options: [1, 2, 3] },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    },
    decorators: [(Story) => <div className="mx-auto max-w-2xl"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof RadioTile>

const PLANS = [
    { value: 'starter', label: 'Starter', description: '1 vessel · email support', icon: <Icon.Bolt /> },
    { value: 'pro', label: 'Pro', description: 'Unlimited vessels · priority support', icon: <Icon.Sparkles />, badge: 'Popular' },
    { value: 'ent', label: 'Enterprise', description: 'SSO, audit logs, SLA', icon: <Icon.ShieldCheck /> },
]

export const Default: Story = {
    render: (args) => {
        const Demo = () => {
            const [value, setValue] = useState('pro')
            return <RadioTile {...args} options={PLANS} value={value} onChange={setValue} label="Choose a plan" />
        }
        return <Demo />
    },
    args: { columns: 3 },
}

export const TwoColumns: Story = {
    render: () => {
        const Demo = () => {
            const [value, setValue] = useState('card')
            return (
                <RadioTile
                    label="Payment method"
                    columns={2}
                    value={value}
                    onChange={setValue}
                    options={[
                        { value: 'card', label: 'Credit card', description: 'Visa, Mastercard, Amex', icon: <Icon.Calculator /> },
                        { value: 'bank', label: 'Bank transfer', description: '2–3 business days', icon: <Icon.Database /> },
                    ]}
                />
            )
        }
        return <Demo />
    },
}

export const WithError: Story = {
    args: { options: PLANS, columns: 3, label: 'Choose a plan', errorMessage: 'Please select a plan to continue.' },
}

export const Disabled: Story = {
    args: { options: PLANS, columns: 3, label: 'Choose a plan', disabled: true, defaultValue: 'starter' },
}
