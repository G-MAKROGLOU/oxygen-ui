import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Checkbox from './Checkbox'

const meta: Meta<typeof Checkbox> = {
    title: 'Forms/Checkbox',
    component: Checkbox,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Checkbox>

// ── Interactive wrapper ───────────────────────────────────────────────────────

function Controlled(props: { label?: string; disabled?: boolean }) {
    const [checked, setChecked] = useState(false)
    return (
        <Checkbox
            {...props}
            checked={checked}
            onChange={({ target }) => setChecked(target.checked)}
            htmlFor="demo"
            label={props.label ?? 'Click to toggle'}
        />
    )
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
    render: () => <Controlled />,
}

export const PreChecked: Story = {
    args: {
        checked: true,
        label: 'Already checked',
        htmlFor: 'pre',
        onChange: () => undefined,
    },
}

export const WithError: Story = {
    args: {
        checked: false,
        label: 'Accept terms and conditions',
        htmlFor: 'err',
        errorMessage: 'You must accept the terms to continue.',
        onChange: () => undefined,
    },
}

export const Disabled: Story = {
    args: {
        checked: false,
        label: 'Disabled unchecked',
        htmlFor: 'dis',
        disabled: true,
        onChange: () => undefined,
    },
}

export const DisabledChecked: Story = {
    args: {
        checked: true,
        label: 'Disabled checked',
        htmlFor: 'disc',
        disabled: true,
        onChange: () => undefined,
    },
}

function CheckboxGroup() {
    const [selected, setSelected] = useState<string[]>([])
    const options = ['Vessel tracking', 'Fuel monitoring', 'Weather alerts', 'Port notifications']
    const toggle = (key: string) =>
        setSelected((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        )
    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground-secondary mb-1">Notification preferences</p>
            {options.map((opt) => (
                <Checkbox
                    key={opt}
                    htmlFor={opt}
                    label={opt}
                    checked={selected.includes(opt)}
                    onChange={() => toggle(opt)}
                />
            ))}
            <p className="text-xs text-foreground-muted mt-1">
                {selected.length} of {options.length} selected
            </p>
        </div>
    )
}

export const Group: Story = {
    render: () => <CheckboxGroup />,
}
