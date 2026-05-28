import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Password from './Password'

const meta: Meta<typeof Password> = {
    title: 'Inputs/Password',
    component: Password,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    args: { label: 'Password', htmlFor: 'pw', placeholder: '••••••••' },
}
export default meta
type Story = StoryObj<typeof Password>

function Controlled(args: React.ComponentProps<typeof Password>) {
    const [v, setV] = useState('')
    return <Password {...args} value={v} onChange={(e) => setV(e.target.value)} />
}

export const Default: Story = { render: (a) => <Controlled {...a} /> }

export const WithError: Story = {
    render: (a) => <Controlled {...a} />,
    args: { errorMessage: 'Must be at least 12 characters' },
}

export const Disabled: Story = {
    render: (a) => <Controlled {...a} />,
    args: { disabled: true },
}
