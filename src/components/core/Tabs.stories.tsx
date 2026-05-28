import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Tabs from './Tabs'
import type { TabItem } from './Tabs'

const meta: Meta<typeof Tabs> = {
    title: 'Data Display/Tabs',
    component: Tabs,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Tabs>

const TABS: TabItem[] = [
    { key: 'overview', label: 'Overview', content: <div className="p-4">Overview content here.</div> },
    { key: 'details', label: 'Details', content: <div className="p-4">Details content here.</div> },
    { key: 'history', label: 'History', content: <div className="p-4">History content here.</div> },
]

const Demo = (args: React.ComponentProps<typeof Tabs>) => {
    const [tabs, setTabs] = useState<TabItem[]>(TABS)
    return (
        <div style={{ width: 600 }}>
            <Tabs {...args} tabs={tabs} onTabsChange={setTabs} />
        </div>
    )
}

export const Default: Story = {
    render: (args) => <Demo {...args} />,
    args: { tabs: TABS },
}

export const Lazy: Story = {
    render: (args) => <Demo {...args} />,
    args: { tabs: TABS, isLazy: true },
}
