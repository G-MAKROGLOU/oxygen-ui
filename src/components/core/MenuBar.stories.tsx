import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import MenuBar from './MenuBar'

const DashIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M3 12l9-9 9 9M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)
const VesselsIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M3 17l9-13 9 13M3 17h18M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)
const ReportsIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h6" strokeLinecap="round" />
    </svg>
)

const meta: Meta<typeof MenuBar> = {
    title: 'Layout/MenuBar',
    component: MenuBar,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
    decorators: [(Story) => <div className="h-screen flex"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof MenuBar>

export const Default: Story = {
    args: {
        items: [
            { key: 'dash',    icon: DashIcon,    title: 'Dashboard', isActive: true,  onClick: () => {} },
            { key: 'vessels', icon: VesselsIcon, title: 'Vessels',   isActive: false, onClick: () => {} },
            { key: 'reports', icon: ReportsIcon, title: 'Reports',   isActive: false, onClick: () => {} },
        ],
    },
}
