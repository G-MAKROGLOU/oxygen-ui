import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import TreeSelect from './TreeSelect'
import type { TreeSelectNode } from './TreeSelect'

const meta: Meta<typeof TreeSelect> = {
    title: 'Forms/TreeSelect',
    component: TreeSelect,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    args: { label: 'Fleet', htmlFor: 'fleet' },
}
export default meta
type Story = StoryObj<typeof TreeSelect>

const TREE: TreeSelectNode[] = [
    {
        key: 'eu', label: 'Europe',
        children: [
            { key: 1, label: 'Aegean Fleet' },
            { key: 2, label: 'Adriatic Fleet' },
            {
                key: 'med', label: 'Mediterranean',
                children: [
                    { key: 3, label: 'Western Med' },
                    { key: 4, label: 'Eastern Med' },
                ],
            },
        ],
    },
    {
        key: 'asia', label: 'Asia',
        children: [
            { key: 5, label: 'Pacific Fleet' },
            { key: 6, label: 'Indian Ocean Fleet', disabled: true },
        ],
    },
    { key: 7, label: 'Americas Fleet' },
]

function Controlled(args: React.ComponentProps<typeof TreeSelect>) {
    const [v, setV] = useState<string | number | null>(args.value ?? null)
    return (
        <TreeSelect
            {...args}
            value={v}
            onChange={({ target }) => setV(target.value)}
        />
    )
}

export const Default: Story = {
    render: (args) => <Controlled {...args} />,
    args: { items: TREE, defaultExpandedKeys: ['eu'] },
}

export const LeavesOnly: Story = {
    name: 'Only leaves are selectable',
    render: (args) => <Controlled {...args} />,
    args: { items: TREE, parentsSelectable: false, defaultExpandedKeys: ['eu', 'med'] },
    parameters: {
        docs: {
            description: {
                story:
                    'With `parentsSelectable={false}`, clicking a branch only toggles its expand state — only leaves can be picked. The parent rows show a "parent" hint.',
            },
        },
    },
}

export const WithIcons: Story = {
    render: (args) => <Controlled {...args} />,
    args: {
        defaultExpandedKeys: ['region'],
        items: [
            {
                key: 'region', label: 'Atlantic',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                        <circle cx="12" cy="12" r="9" />
                    </svg>
                ),
                children: [
                    { key: 'n', label: 'North' },
                    { key: 's', label: 'South' },
                ],
            },
        ],
    },
}

export const WithError: Story = {
    render: (args) => <Controlled {...args} />,
    args: { items: TREE, errorMessage: 'Fleet is required', defaultExpandedKeys: [] },
}

export const Disabled: Story = {
    render: (args) => <Controlled {...args} />,
    args: { items: TREE, disabled: true, value: 1 },
}
