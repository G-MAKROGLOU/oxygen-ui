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

export const MultiselectPrefilled: Story = {
    name: 'Multiselect with removable tags',
    parameters: {
        docs: {
            description: {
                story:
                    'Selected values render as removable tag chips (the same chip the TagsInput uses). Clicking a tag\'s × deselects that option; the trigger grows to fit wrapped tags.',
            },
        },
    },
    render: () => {
        function Demo() {
            const [val, setVal] = useState<(number | string)[]>([1, 2, 3])
            return (
                <div style={{ width: 280 }}>
                    <Dropdown
                        items={ITEMS}
                        value={val}
                        label="Select options"
                        isMultiselect
                        onChange={(e) => setVal(e.target.value as any)}
                    />
                </div>
            )
        }
        return <Demo />
    },
}

export const WithError: Story = {
    args: { items: ITEMS, label: 'Pick one', errorMessage: 'Selection is required' },
    parameters: {
        docs: {
            description: {
                story:
                    'When `errorMessage` is set, the trigger gets a red border + `aria-invalid` and the message renders under the trigger only (not under the label in horizontal layouts).',
            },
        },
    },
}

export const Disabled: Story = {
    args: { items: ITEMS, value: 1, isMultiselect: false, disabled: true, label: 'Disabled' },
}
