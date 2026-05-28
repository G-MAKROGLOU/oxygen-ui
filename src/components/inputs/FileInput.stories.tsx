import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import FileInput from './FileInput'

const meta: Meta<typeof FileInput> = {
    title: 'Forms/FileInput',
    component: FileInput,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    decorators: [(S) => <div className="w-80 h-60"><S /></div>],
    args: { accept: 'image/*,.xlsx', name: 'upload' },
}
export default meta
type Story = StoryObj<typeof FileInput>

export const Default:  Story = {}
export const Multiple: Story = { args: { allowMultiple: true } }
