import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Tree from './Tree'
import type { TreeNode } from './Tree'

const meta: Meta<typeof Tree> = {
    title: 'Core/Tree',
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
]

export const Default: Story = {
    args: {
        nodes: NODES,
        onNodeClick: (payload) => console.log('clicked:', payload),
    },
}

export const AllExpanded: Story = {
    args: {
        nodes: NODES,
        defaultExpandAll: true,
        onNodeClick: (payload) => console.log('clicked:', payload),
    },
}
