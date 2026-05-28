import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import ToggleButton from './ToggleButton'

const GridIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
        <rect x="3" y="3"  width="7" height="7" /><rect x="14" y="3"  width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
)
const ListIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
    </svg>
)

const meta: Meta<typeof ToggleButton> = {
    title: 'Buttons/ToggleButton',
    component: ToggleButton,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof ToggleButton>

function Controlled() {
    const [view, setView] = useState('grid')
    return (
        <ToggleButton
            activeKey={view}
            onChange={setView}
            items={[
                { key: 'grid', icon: GridIcon, label: 'Grid' },
                { key: 'list', icon: ListIcon, label: 'List' },
            ]}
        />
    )
}

export const Default: Story = { render: () => <Controlled /> }
