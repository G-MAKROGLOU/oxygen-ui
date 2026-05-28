import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import DropdownPill from './DropdownPill'

const meta: Meta<typeof DropdownPill> = {
    title: 'Data Display/DropdownPill',
    component: DropdownPill,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof DropdownPill>

export const Single: Story = { args: { value: 'Athens' } }
export const InGroup: Story = {
    name: 'When sibling pills are present',
    args: { value: 'Athens', hasSiblings: true },
}
export const MultipleInline: Story = {
    name: 'A row of pills',
    render: () => (
        <div className="flex gap-1.5">
            <DropdownPill value="Aegean"  hasSiblings />
            <DropdownPill value="Aurora"  hasSiblings />
            <DropdownPill value="Beacon"  hasSiblings />
            <DropdownPill value="+5 more" hasSiblings />
        </div>
    ),
}
