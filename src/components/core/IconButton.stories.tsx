import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import IconButton from './IconButton'

const SearchIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" strokeLinecap="round" />
    </svg>
)

const Spinner = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 animate-spin" aria-hidden="true">
        <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388z" clipRule="evenodd" />
    </svg>
)

const meta: Meta<typeof IconButton> = {
    title: 'Inputs/IconButton',
    component: IconButton,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    args: { icon: SearchIcon, type: 'primary', size: 'lg' },
}
export default meta
type Story = StoryObj<typeof IconButton>

export const Primary: Story = {}
export const Bordered: Story = { args: { type: 'bordered' } }
export const Small: Story = { args: { size: 'sm' } }
export const Disabled: Story = { args: { disabled: true } }
export const Loading: Story = { args: { loading: true, loadingIcon: Spinner } }
