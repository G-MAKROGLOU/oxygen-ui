import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import TextArea from './TextArea'

const meta: Meta<typeof TextArea> = {
    title: 'Inputs/TextArea',
    component: TextArea,
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
                    'Multi-line text input on the shared field foundation. Optional auto-grow (expands with content between `rows` and `maxRows`), character counter, and resize control. Same Halo Focus and error handling as the single-line inputs.',
            },
        },
    },
    decorators: [(S) => <div className="w-96"><S /></div>],
    args: { label: 'Notes', htmlFor: 'notes', placeholder: 'Type here…' },
}
export default meta
type Story = StoryObj<typeof TextArea>

function Controlled(args: React.ComponentProps<typeof TextArea>) {
    const [v, setV] = useState('')
    return <TextArea {...args} value={v} onChange={(e) => setV(e.target.value)} />
}

export const Default: Story = { render: (a) => <Controlled {...a} /> }

export const AutoGrow: Story = {
    name: 'Auto-grow',
    render: (a) => <Controlled {...a} />,
    args: { autoGrow: true, rows: 2, maxRows: 8, placeholder: 'Grows as you type…' },
}

export const WithCounter: Story = {
    render: (a) => <Controlled {...a} />,
    args: { maxLength: 280, showCount: true, label: 'Bio' },
}

export const WithError: Story = {
    render: (a) => <Controlled {...a} />,
    args: { errorMessage: 'This field is required', required: true },
}

export const Disabled: Story = {
    render: (a) => <Controlled {...a} />,
    args: { disabled: true, value: 'Read-only content' },
}
