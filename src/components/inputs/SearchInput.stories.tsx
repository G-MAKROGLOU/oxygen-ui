import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import SearchInput from './SearchInput'

const meta: Meta<typeof SearchInput> = {
    title: 'Inputs/SearchInput',
    component: SearchInput,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    args: { placeholder: 'Search vessels…', htmlFor: 'search' },
}
export default meta
type Story = StoryObj<typeof SearchInput>

function Controlled(args: React.ComponentProps<typeof SearchInput>) {
    const [v, setV] = useState('')
    return <SearchInput {...args} value={v} onChange={(e) => setV(e.target.value)} />
}

export const Default: Story = { render: (a) => <Controlled {...a} /> }
export const WithLabel: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Find a vessel' } }
export const Disabled: Story = { render: (a) => <Controlled {...a} />, args: { disabled: true } }
