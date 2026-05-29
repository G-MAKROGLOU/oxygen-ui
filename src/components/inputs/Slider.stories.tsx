import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Slider, { type SliderValue } from './Slider'

const meta: Meta<typeof Slider> = {
    title: 'Inputs/Slider',
    component: Slider,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Range slider on Radix Slider. Pass a single number for a one-thumb slider, or a `[min, max]` tuple for a two-thumb range. Optional tick marks, drag tooltip, and a value readout beside the label.',
            },
        },
    },
    decorators: [(S) => <div className="w-80"><S /></div>],
}
export default meta
type Story = StoryObj<typeof Slider>

export const Single: Story = {
    render: () => {
        const [v, setV] = useState<SliderValue>(40)
        return <Slider label="Volume" value={v} onChange={setV} showValue />
    },
}

export const Range: Story = {
    render: () => {
        const [v, setV] = useState<SliderValue>([20, 80])
        return <Slider label="Price range" value={v} onChange={setV} showValue formatValue={(n) => `$${n}`} />
    },
}

export const WithMarks: Story = {
    name: 'Marks + tooltip',
    render: () => {
        const [v, setV] = useState<SliderValue>(50)
        return (
            <Slider
                label="Quality"
                value={v}
                onChange={setV}
                tooltip
                marks={[
                    { value: 0, label: 'Low' },
                    { value: 50, label: 'Med' },
                    { value: 100, label: 'High' },
                ]}
            />
        )
    },
}

export const Stepped: Story = {
    render: () => {
        const [v, setV] = useState<SliderValue>(25)
        return <Slider label="Zoom" value={v} onChange={setV} step={25} showValue formatValue={(n) => `${n}%`} />
    },
}

export const Disabled: Story = {
    render: () => <Slider label="Locked" value={30} disabled showValue />,
}
