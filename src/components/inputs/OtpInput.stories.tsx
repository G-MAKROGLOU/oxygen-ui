import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import OtpInput from './OtpInput'

const meta: Meta<typeof OtpInput> = {
    title: 'Inputs/OtpInput',
    component: OtpInput,
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
                    'Segmented one-time-code / PIN input. Auto-advances on type, Backspace retreats, pasting a code spreads it across boxes. `masked` for PIN entry, `mode="alphanumeric"` for letter codes.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof OtpInput>

function Controlled(args: React.ComponentProps<typeof OtpInput>) {
    const [code, setCode] = useState('')
    return <OtpInput {...args} value={code} onChange={setCode} />
}

export const SixDigit: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Verification code', length: 6 } }
export const Grouped: Story = { name: 'Grouped (3 + 3)', render: (a) => <Controlled {...a} />, args: { length: 6, groupAfter: 3 } }
export const PinMasked: Story = { name: 'Masked PIN', render: (a) => <Controlled {...a} />, args: { label: 'PIN', length: 4, masked: true } }
export const Alphanumeric: Story = { render: (a) => <Controlled {...a} />, args: { length: 5, mode: 'alphanumeric' } }
export const WithError: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Code', length: 6, errorMessage: 'That code is incorrect' } }
