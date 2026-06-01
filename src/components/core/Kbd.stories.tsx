import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Kbd from './Kbd'

const meta: Meta<typeof Kbd> = {
    title: 'Data Display/Kbd',
    component: Kbd,
    parameters: { layout: 'centered' },
    argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
}
export default meta
type Story = StoryObj<typeof Kbd>

export const Single: Story = { args: { children: 'Esc' } }

export const Combo: Story = {
    render: () => (
        <div className="flex flex-col items-start gap-3">
            <Kbd keys={['Ctrl', 'K']} />
            <Kbd keys={['⌘', '⇧', 'P']} />
            <Kbd keys={['Alt', 'F4']} size="sm" />
        </div>
    ),
}

export const InText: Story = {
    render: () => (
        <p className="text-sm text-foreground-secondary max-w-sm">
            Press <Kbd keys={['Ctrl', 'K']} size="sm" /> to open the command palette, or{' '}
            <Kbd size="sm">/</Kbd> to focus search.
        </p>
    ),
}
