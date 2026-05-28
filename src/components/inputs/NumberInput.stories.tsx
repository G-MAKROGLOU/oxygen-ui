import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import NumberInput from './NumberInput'

const meta: Meta<typeof NumberInput> = {
    title: 'Forms/NumberInput',
    component: NumberInput,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    args: {
        label: 'Quantity',
        htmlFor: 'qty',
    },
}
export default meta
type Story = StoryObj<typeof NumberInput>

// Controlled wrapper so the stepper buttons actually mutate state.
function Controlled(args: React.ComponentProps<typeof NumberInput>) {
    const [v, setV] = useState<number | undefined>(args.value as number | undefined)
    return (
        <NumberInput
            {...args}
            value={v ?? ''}
            onChange={({ target }) => setV(target.value)}
        />
    )
}

export const Default: Story = {
    render: (args) => <Controlled {...args} />,
    args: { value: 1 },
}

export const WithMinMax: Story = {
    render: (args) => <Controlled {...args} />,
    args: { value: 5, min: 0, max: 10, label: 'Score (0–10)' },
}

export const DecimalStep: Story = {
    name: 'Decimal step (no FP drift)',
    render: (args) => <Controlled {...args} />,
    args: { value: 1.5, step: 0.1, precision: 2, label: 'Tonnage', placeholder: '0.00' },
    parameters: {
        docs: {
            description: {
                story:
                    'Step of `0.1` rounds to the inferred precision (1 decimal). Click increment ten times — the value is exactly `2.5`, not `2.4999999…` as the previous component produced.',
            },
        },
    },
}

export const VerticalLayout: Story = {
    render: (args) => <Controlled {...args} />,
    args: { value: 3, layout: 'vertical' },
}

export const Disabled: Story = {
    render: (args) => <Controlled {...args} />,
    args: { value: 42, disabled: true },
}

export const ReadOnly: Story = {
    render: (args) => <Controlled {...args} />,
    args: { value: 99, readOnly: true },
}

export const WithError: Story = {
    render: (args) => <Controlled {...args} />,
    args: { value: 1000, errorMessage: 'Must be at most 100' },
    parameters: {
        docs: {
            description: {
                story:
                    'Error state. The input gains `aria-invalid` and `aria-describedby` pointing at the error region, plus a red border. The error message is only rendered when present — no empty announcement.',
            },
        },
    },
}
