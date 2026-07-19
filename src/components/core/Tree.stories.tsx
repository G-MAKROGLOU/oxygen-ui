import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
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

// Mirrors the deepest real-world structure (7 levels:
// Vessels → group → fleet → class → vessel → mode → report-type) -
// regression story for the additive-indentation clipping bug.
const DEEP_NODES: TreeNode[] = [
    {
        key: 'vessels', label: 'Vessels',
        children: [{
            key: 'group', label: 'Dry cargo group',
            children: [{
                key: 'fleet', label: 'Atlantic fleet',
                children: [{
                    key: 'class', label: 'Panamax class',
                    children: [{
                        key: 'vessel', label: 'MV Aurora',
                        children: [{
                            key: 'mode', label: 'At sea',
                            children: [
                                { key: 'noon', label: 'Noon report' },
                                { key: 'departure', label: 'Departure report' },
                                { key: 'arrival', label: 'Arrival report' },
                            ],
                        }],
                    }],
                }],
            }],
        }],
    },
]

export const DeeplyNested: Story = {
    name: 'Deeply nested (7 levels)',
    args: { nodes: DEEP_NODES, defaultExpandAll: true },
    decorators: [(StoryFn) => <div className="w-80 overflow-hidden rounded-lg border border-border bg-surface p-3"><StoryFn /></div>],
}

const FileIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4a1 1 0 0 0 1 1h4M5 3h9l5 5v13H5z" />
    </svg>
)

// Leaf icon override + the click model: the chevron toggles expand/collapse;
// clicking a node's label fires onNodeClick (e.g. open a report) WITHOUT
// toggling. Open the Actions/console to see only label clicks fire.
export const CustomLeafIcon: Story = {
    name: 'Custom leaf icon + click separation',
    args: {
        nodes: NODES,
        defaultExpandAll: true,
        leafIcon: FileIcon,
        onNodeClick: (payload) => console.log('node clicked (not toggle):', payload),
    },
    decorators: [(StoryFn) => <div style={{ width: 280 }}><StoryFn /></div>],
}
