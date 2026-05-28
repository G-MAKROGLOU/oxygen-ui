import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TooltipProvider } from './Tooltip'
import MenuBarItem from './MenuBarItem'

const DashIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" aria-hidden="true">
        <path d="M3 12l9-9 9 9M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const meta: Meta<typeof MenuBarItem> = {
    title: 'Layout/MenuBarItem',
    component: MenuBarItem,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [(S) => <TooltipProvider><div className="bg-surface-raised p-2 rounded-lg"><S /></div></TooltipProvider>],
    args: { icon: DashIcon, title: 'Dashboard' },
}
export default meta
type Story = StoryObj<typeof MenuBarItem>

export const Inactive: Story = { args: { isActive: false } }
export const Active:   Story = { args: { isActive: true  } }
