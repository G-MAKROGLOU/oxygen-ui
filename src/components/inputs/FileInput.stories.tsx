import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import FileInput from './FileInput'

const meta: Meta<typeof FileInput> = {
    title: 'Inputs/FileInput',
    component: FileInput,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Drag-and-drop file input. Calm dashed dropzone with a contained icon badge, primary + secondary copy, accent-tinted drag-over state, and selected files shown as chips with name + size. Keyboard-activatable and form-friendly (error state, required, maxSize validation).',
            },
        },
    },
    decorators: [(S) => <div className="w-96"><S /></div>],
    args: { name: 'upload', label: 'Attachment' },
}
export default meta
type Story = StoryObj<typeof FileInput>

export const Default: Story = {
    args: { hint: 'Any file type, up to 10 MB' },
}

export const Multiple: Story = {
    args: { allowMultiple: true, hint: 'Select one or more files' },
}

export const Restricted: Story = {
    name: 'Accept + size limit',
    args: {
        accept: '.xlsx,.csv',
        hint: 'XLSX or CSV, up to 5 MB',
        maxSize: 5 * 1024 * 1024,
    },
    parameters: {
        docs: {
            description: {
                story:
                    'Constrain accepted types with `accept` and enforce a size ceiling with `maxSize` (bytes). Oversized files are rejected inline with an error message.',
            },
        },
    },
}

export const WithError: Story = {
    args: { errorMessage: 'A file is required' },
}

export const Disabled: Story = {
    args: { disabled: true, hint: 'Uploads are paused' },
}
