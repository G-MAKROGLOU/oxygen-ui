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
    args: {
        label: 'Select option',
        placeholder: 'Choose…',
        items: ITEMS,
        isMultiselect: false,
        hasSearch: true,
        layout: 'vertical',
        size: 'md',
        disabled: false,
    },
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
        isMultiselect: { control: 'boolean' },
        hasSearch: { control: 'boolean' },
        disabled: { control: 'boolean' },
        label: { control: 'text' },
        placeholder: { control: 'text' },
        errorMessage: { control: 'text' },
    },
}
export default meta
type Story = StoryObj<typeof Dropdown>

// Controlled wrapper: owns selection state while spreading every arg from the
// Controls panel through to the component, so size/layout/multiselect/etc. are
// all live-editable.
function Controlled(args: React.ComponentProps<typeof Dropdown>) {
    const [val, setVal] = useState<number | string | (number | string)[]>(
        args.isMultiselect ? [] : '',
    )
    // Reset the held value when the selection mode flips, so a stale array
    // doesn't leak into single mode (or vice-versa).
    React.useEffect(() => {
        setVal(args.isMultiselect ? [] : '')
    }, [args.isMultiselect])
    return (
        <div style={{ minWidth: 240 }}>
            <Dropdown {...args} value={val} onChange={(e) => setVal(e.target.value)} />
            <p className="mt-2 text-sm text-foreground-secondary">
                Selected: {Array.isArray(val) ? val.join(', ') || '—' : String(val) || '—'}
            </p>
        </div>
    )
}

export const Single: Story = { render: (a) => <Controlled {...a} /> }

export const Multiselect: Story = {
    render: (a) => <Controlled {...a} />,
    args: { label: 'Select options', isMultiselect: true },
}

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
