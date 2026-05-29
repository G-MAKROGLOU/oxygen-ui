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
    args: {
        label: 'Volume',
        min: 0,
        max: 100,
        step: 1,
        size: 'md',
        showValue: true,
        tooltip: false,
        disabled: false,
    },
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        min: { control: { type: 'number' } },
        max: { control: { type: 'number' } },
        step: { control: { type: 'number', min: 1 } },
        showValue: { control: 'boolean' },
        tooltip: { control: 'boolean' },
        disabled: { control: 'boolean' },
        label: { control: 'text' },
    },
}
export default meta
type Story = StoryObj<typeof Slider>

// Controlled wrapper spreading args so size/min/max/step/showValue/tooltip
// are all live from the Controls panel.
function Controlled(args: React.ComponentProps<typeof Slider> & { initial?: SliderValue }) {
    const { initial = 40, ...rest } = args
    const [v, setV] = useState<SliderValue>(initial)
    return <Slider {...rest} value={v} onChange={setV} />
}

export const Single: Story = { render: (a) => <Controlled {...a} initial={40} /> }

export const Range: Story = {
    render: (a) => <Controlled {...a} initial={[20, 80]} />,
    args: { label: 'Price range', formatValue: (n) => `$${n}` },
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
