import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import List from './List'

const meta: Meta<typeof List> = {
    title: 'Data Display/List',
    component: List,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [(S) => <div className="w-72"><S /></div>],
}
export default meta
type Story = StoryObj<typeof List>

const ITEMS = [
    { key: 1, label: 'Aurora'  },
    { key: 2, label: 'Beacon'  },
    { key: 3, label: 'Catalina' },
    { key: 4, label: 'Discovery' },
]

function Controlled() {
    const [active, setActive] = useState<string | number>(2)
    return <List items={ITEMS} activeKey={active} onItemClick={(it) => setActive(it.key)} />
}

export const Default: Story = { render: () => <Controlled /> }
