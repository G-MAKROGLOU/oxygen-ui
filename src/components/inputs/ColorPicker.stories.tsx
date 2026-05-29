import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import ColorPicker from './ColorPicker'

const meta: Meta<typeof ColorPicker> = {
    title: 'Inputs/ColorPicker',
    component: ColorPicker,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Swatch trigger that opens a popover with preset swatches, a hex input, and the native full picker for custom colours. Value is a hex string.',
            },
        },
    },
    decorators: [(S) => <div className="w-64"><S /></div>],
}
export default meta
type Story = StoryObj<typeof ColorPicker>

function Controlled(args: React.ComponentProps<typeof ColorPicker>) {
    const [v, setV] = useState(args.value ?? '')
    return <ColorPicker {...args} value={v} onChange={setV} />
}

export const Default: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Brand colour' } }
export const Preselected: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Accent', value: '#0466c8' } }
export const CustomSwatches: Story = {
    render: (a) => <Controlled {...a} />,
    args: { label: 'Theme', swatches: ['#0a1929', '#0466c8', '#1e8449', '#d68910', '#c0392b', '#8e44ad'] },
}
export const WithError: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Colour', errorMessage: 'Pick a colour' } }
