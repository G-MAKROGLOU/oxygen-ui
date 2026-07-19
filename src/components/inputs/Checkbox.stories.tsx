import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Checkbox from './Checkbox'

const meta: Meta<typeof Checkbox> = {
    title: 'Inputs/Checkbox',
    component: Checkbox,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: {
        layout: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
        labelPosition: { control: 'inline-radio', options: ['right', 'left'] },
        label: { control: 'text' },
        description: { control: 'text' },
        helperText: { control: 'text' },
        errorMessage: { control: 'text' },
        disabled: { control: 'boolean' },
        required: { control: 'boolean' },
        checked: { control: 'boolean' },
    },
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

export const WithDescription: Story = {
    name: 'With description',
    args: {
        checked: true,
        label: 'Email notifications',
        description: 'Get notified about account activity and security alerts.',
        htmlFor: 'desc',
        helperText: 'You can change this any time in settings.',
        onChange: () => undefined,
    },
    parameters: {
        docs: {
            description: {
                story: 'A secondary `description` wraps under the label, the same affordance RadioGroup options use. Works with `helperText` and either label side.',
            },
        },
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

export const LabelLeft: Story = {
    name: 'Horizontal, label on the left',
    args: {
        checked: true,
        label: 'Enabled',
        description: 'The box sits to the right; the description wraps under the label.',
        htmlFor: 'll',
        labelPosition: 'left',
        onChange: () => undefined,
    },
    parameters: {
        docs: {
            description: {
                story: 'In horizontal layout, `labelPosition="left"` renders the label before the box (useful in right-aligned settings rows). A `description` wraps under the label, never pushing the box.',
            },
        },
    },
}

export const Vertical: Story = {
    name: 'Vertical layout',
    args: {
        checked: false,
        label: 'Stack the label above',
        htmlFor: 'vert',
        layout: 'vertical',
        labelPosition: 'left',
        onChange: () => undefined,
    },
    parameters: {
        docs: {
            description: {
                story: '`layout="vertical"` stacks box and label. With `labelPosition="left"` the label sits above the box; `"right"` puts it below.',
            },
        },
    },
}
