import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Rating from './Rating'

const meta: Meta<typeof Rating> = {
    title: 'Inputs/Rating',
    component: Rating,
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
                    'Star (or custom glyph) rating with optional half-steps, hover preview, and read-only mode. Keyboard: arrows adjust, Home/End jump to min/max.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof Rating>

function Controlled(args: React.ComponentProps<typeof Rating>) {
    const [v, setV] = useState(args.defaultValue ?? 0)
    return <Rating {...args} value={v} onChange={setV} />
}

export const Default: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Rate this' } }
export const HalfSteps: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Precision', allowHalf: true, defaultValue: 3.5 } }
export const ReadOnly: Story = { args: { value: 4, readOnly: true, label: 'Average rating' } }
export const Sizes: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            {(['sm', 'md', 'lg'] as const).map((s) => <Rating key={s} size={s} defaultValue={3} />)}
        </div>
    ),
}
export const TenScale: Story = { render: (a) => <Controlled {...a} />, args: { count: 10, label: 'Score out of 10' } }
