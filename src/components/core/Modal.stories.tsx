import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Modal from './Modal'
import Button from '../inputs/Button'

const meta: Meta<typeof Modal> = {
    title: 'Core/Modal',
    component: Modal,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Modal>

const ModalDemo = (args: React.ComponentProps<typeof Modal>) => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button content="Open Modal" onClick={() => setOpen(true)} />
            <Modal {...args} isOpen={open} onClose={() => setOpen(false)} />
        </>
    )
}

export const Default: Story = {
    render: (args) => <ModalDemo {...args} />,
    args: {
        title: 'Example Modal',
        children: <p className="text-sm text-gray-600">This is the modal body content.</p>,
    },
}

export const WithFooter: Story = {
    render: (args) => <ModalDemo {...args} />,
    args: {
        title: 'Confirm Action',
        children: <p className="text-sm">Are you sure you want to proceed?</p>,
        footer: (
            <div className="flex justify-end gap-2 mt-4">
                <Button content="Cancel" style={{ background: 'gray' }} />
                <Button content="Confirm" />
            </div>
        ),
    },
}
