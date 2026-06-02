import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import MenuButton, { type MenuButtonItem } from './MenuButton'

const meta: Meta<typeof MenuButton> = {
    title: 'Buttons/MenuButton',
    component: MenuButton,
    parameters: { layout: 'centered' },
    argTypes: {
        variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    },
}
export default meta
type Story = StoryObj<typeof MenuButton>

const EditIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
const CopyIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
const TrashIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>

const items: MenuButtonItem[] = [
    { key: 'edit', label: 'Edit', icon: EditIcon, onSelect: () => {} },
    { key: 'dup', label: 'Duplicate', icon: CopyIcon, onSelect: () => {} },
    { key: 'del', label: 'Delete', icon: TrashIcon, danger: true, separatorBefore: true, onSelect: () => {} },
]

export const Default: Story = {
    args: { label: 'Actions', items, variant: 'secondary', size: 'md', align: 'start' },
}

export const Primary: Story = {
    args: { label: 'Options', items, variant: 'primary' },
}

export const WithDisabledItem: Story = {
    args: {
        label: 'Manage',
        items: [
            { key: 'a', label: 'Rename', onSelect: () => {} },
            { key: 'b', label: 'Archive (unavailable)', disabled: true },
            { key: 'c', label: 'Delete', danger: true, separatorBefore: true, onSelect: () => {} },
        ],
    },
}
