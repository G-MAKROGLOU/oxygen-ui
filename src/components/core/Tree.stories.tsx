import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Tree from './Tree'
import type { TreeNode } from './Tree'

const meta: Meta<typeof Tree> = {
    title: 'Data Display/Tree',
    component: Tree,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Tree>

const NODES: TreeNode[] = [
    {
        key: 'fleet-1',
        label: 'Fleet Alpha',
        children: [
            { key: 'v1', label: 'Vessel Argo', children: [] },
            { key: 'v2', label: 'Vessel Poseidon', children: [] },
            {
                key: 'v3',
                label: 'Vessel Hermes',
                children: [
                    { key: 'v3-1', label: 'Hermes Jr.', children: [] },
                ],
            },
        ],
    },
    {
        key: 'fleet-2',
        label: 'Fleet Beta',
        children: [
            { key: 'v4', label: 'Vessel Triton', children: [] },
        ],
    },
    {
        key: 'fleet-3',
        label: 'Fleet Gamma',
        children: [
            {
                key: 'v5',
                label: 'Vessel Atlas',
                children: [
                    { key: 'v5-1', label: 'Atlas I', children: [] },
                    { key: 'v5-2', label: 'Atlas II', children: [] },
                ],
            },
            { key: 'v6', label: 'Vessel Orion', children: [] },
        ],
    },
]

export const Default: Story = {
    args: {
        nodes: NODES,
        onNodeClick: (payload) => console.log('clicked:', payload),
    },
    decorators: [
        (Story) => (
            <div style={{ width: 260 }}>
                <Story />
            </div>
        ),
    ],
}

export const AllExpanded: Story = {
    args: {
        nodes: NODES,
        defaultExpandAll: true,
        onNodeClick: (payload) => console.log('clicked:', payload),
    },
    decorators: [
        (Story) => (
            <div style={{ width: 260 }}>
                <Story />
            </div>
        ),
    ],
}

export const PartiallyExpanded: Story = {
    args: {
        nodes: NODES,
        defaultExpandedKeys: ['fleet-1', 'v3'],
        onNodeClick: (payload) => console.log('clicked:', payload),
    },
    decorators: [
        (Story) => (
            <div style={{ width: 260 }}>
                <Story />
            </div>
        ),
    ],
}
