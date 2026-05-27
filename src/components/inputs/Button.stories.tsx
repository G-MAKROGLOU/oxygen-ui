import type { Meta, StoryObj } from '@storybook/react'
import Button from './Button'

const meta: Meta<typeof Button> = {
    title: 'Inputs/Button',
    component: Button,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    args: { content: 'Click Me' },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {}

export const Loading: Story = {
    args: { loading: true, content: 'Saving...' },
}

export const Disabled: Story = {
    args: { disabled: true, content: 'Disabled' },
}

export const CustomWidth: Story = {
    args: { content: 'Wide Button', style: { width: 200 } },
}
