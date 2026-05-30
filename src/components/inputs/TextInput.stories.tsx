import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import TextInput from './TextInput'

const meta: Meta<typeof TextInput> = {
    title: 'Inputs/TextInput',
    component: TextInput,
    parameters: { layout: 'centered' },
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
}
export default meta
type Story = StoryObj<typeof TextInput>

const Demo = (args: React.ComponentProps<typeof TextInput>) => {
    const [val, setVal] = useState('')
    return <TextInput {...args} value={val} onChange={(e) => setVal(e.target.value)} />
}

export const Vertical: Story = {
    render: (args) => <Demo {...args} />,
    args: { label: 'Vessel Name', layout: 'vertical', placeholder: 'Enter vessel name...' },
}

export const Horizontal: Story = {
    render: (args) => <Demo {...args} />,
    args: { label: 'IMO', layout: 'horizontal', placeholder: '9000000' },
}

export const WithError: Story = {
    render: (args) => <Demo {...args} />,
    args: { label: 'Email', layout: 'vertical', errorMessage: 'Invalid email address' },
}
