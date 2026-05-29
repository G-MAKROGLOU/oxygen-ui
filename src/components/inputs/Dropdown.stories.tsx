import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Dropdown from './Dropdown'

const ITEMS = [
    { key: 1, value: 'alpha', label: 'Alpha' },
    { key: 2, value: 'beta', label: 'Beta' },
    { key: 3, value: 'gamma', label: 'Gamma' },
    { key: 4, value: 'delta', label: 'Delta' },
]

const meta: Meta<typeof Dropdown> = {
    title: 'Inputs/Dropdown',
    component: Dropdown,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Dropdown>

const SingleDemo = () => {
    const [val, setVal] = useState<number | string>('')
    return (
        <div style={{ width: 220 }}>
            <Dropdown
                items={ITEMS}
                value={val}
                label="Select option"
                isMultiselect={false}
                onChange={(e) => setVal(e.target.value as any)}
            />
            <p className="mt-2 text-sm">Selected: {String(val)}</p>
        </div>
    )
}

const MultiDemo = () => {
    const [val, setVal] = useState<(number | string)[]>([])
    return (
        <div style={{ width: 220 }}>
            <Dropdown
                items={ITEMS}
                value={val}
                label="Select options"
                isMultiselect={true}
                onChange={(e) => setVal(e.target.value as any)}
            />
            <p className="mt-2 text-sm">Selected: {(val as any[]).join(', ')}</p>
        </div>
    )
}

export const Single: Story = { render: () => <SingleDemo /> }
export const Multiselect: Story = { render: () => <MultiDemo /> }
export const Disabled: Story = {
    args: { items: ITEMS, value: 1, isMultiselect: false, disabled: true, label: 'Disabled' },
}
