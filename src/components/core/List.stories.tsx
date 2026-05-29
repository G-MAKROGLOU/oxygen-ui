import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import List from './List'
import Avatar from './Avatar'

const meta: Meta<typeof List> = {
    title: 'Data Display/List',
    component: List,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Vertical clickable list with optional `avatar` / `description` / `trailing` slots per item. Renders as `role="listbox"` with `role="option"` items — Enter/Space activate. Use it for "browse + pick one" surfaces (sidebar nav, contact list, vessel chooser).',
            },
        },
    },
    decorators: [(S) => <div className="w-80"><S /></div>],
}
export default meta
type Story = StoryObj<typeof List>

const VESSELS = [
    { key: 1, label: 'Aurora'   },
    { key: 2, label: 'Beacon'   },
    { key: 3, label: 'Catalina' },
    { key: 4, label: 'Discovery' },
]

function Plain() {
    const [active, setActive] = useState<string | number>(2)
    return <List items={VESSELS} activeKey={active} onItemClick={(it) => setActive(it.key)} />
}

export const Plain_: Story = {
    render: () => <Plain />,
}

const CREW = [
    { key: 'a', label: 'Jane Doe',     description: 'Captain',         avatar: <Avatar alt="Jane Doe"     size="sm" status="online" />, trailing: '12' },
    { key: 'b', label: 'Marko Petrov', description: 'Chief engineer',  avatar: <Avatar alt="Marko Petrov" size="sm" status="busy"   />, trailing: '4'  },
    { key: 'c', label: 'Lin Chen',     description: '2nd officer',     avatar: <Avatar alt="Lin Chen"     size="sm" status="away"   />, trailing: ''   },
    { key: 'd', label: 'Sam Carter',   description: 'AB',              avatar: <Avatar alt="Sam Carter"   size="sm" status="offline" />, trailing: ''   },
]

function Rich() {
    const [active, setActive] = useState<string | number>('a')
    return <List items={CREW} activeKey={active} onItemClick={(it) => setActive(it.key)} />
}

export const WithAvatarsAndDescriptions: Story = {
    name: 'Rich — avatar + description + trailing',
    parameters: {
        docs: {
            description: {
                story:
                    'Each `ListItem` accepts `avatar` (leading slot), `description` (subtitle text), and `trailing` (badge / count / icon). The active item is highlighted via `activeKey`.',
            },
        },
    },
    render: () => <Rich />,
}

export const Density: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    '`density` picks the row vertical padding — `compact` for dense reference lists, `comfortable` (default) for typical UI, `spacious` for hero rows.',
            },
        },
    },
    render: () => (
        <div className="flex flex-col gap-4">
            {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
                <div key={d}>
                    <code className="text-xs text-foreground-muted">density="{d}"</code>
                    <List items={VESSELS} onItemClick={() => undefined} density={d} />
                </div>
            ))}
        </div>
    ),
}

export const Disabled: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Items with `disabled: true` are visible but not activatable (mouse + keyboard both ignored).',
            },
        },
    },
    render: () => (
        <List
            items={[
                ...VESSELS,
                { key: 99, label: 'Decommissioned', disabled: true },
            ]}
            onItemClick={() => undefined}
        />
    ),
}
