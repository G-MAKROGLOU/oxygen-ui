import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Modal from './Modal'
import Button from '../inputs/Button'

const meta: Meta<typeof Modal> = {
    title: 'Feedback/Modal',
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
            <Modal
                {...args}
                isOpen={open}
                onClose={() => setOpen(false)}
                onOk={() => setOpen(false)}
                onCancel={() => setOpen(false)}
            />
        </>
    )
}

export const Default: Story = {
    render: (args) => <ModalDemo {...args} />,
    args: {
        title: 'Example Modal',
        children: <p className="text-sm text-foreground-secondary">This is the modal body content.</p>,
    },
}

export const WithoutFooter: Story = {
    render: (args) => <ModalDemo {...args} />,
    args: {
        title: 'Read-only Modal',
        hasFooter: false,
        children: <p className="text-sm text-foreground-secondary">No footer — dismiss with the close button or Escape.</p>,
    },
}

export const CustomButtonText: Story = {
    render: (args) => <ModalDemo {...args} />,
    args: {
        title: 'Delete vessel?',
        okText: 'Delete',
        cancelText: 'Keep',
        children: <p className="text-sm text-foreground-secondary">This permanently removes the record and all associated data.</p>,
    },
}

export const CustomWidth: Story = {
    render: (args) => <ModalDemo {...args} />,
    args: {
        title: 'Compact Modal',
        width: 420,
        children: <p className="text-sm text-foreground-secondary">A narrower 420 px panel for short confirmations.</p>,
    },
}

export const ScrollingBody: Story = {
    render: (args) => <ModalDemo {...args} />,
    args: {
        title: 'Terms & Conditions',
        okText: 'Accept',
        children: (
            <div className="space-y-3 text-sm text-foreground-secondary">
                {Array.from({ length: 12 }, (_, i) => (
                    <p key={i}>
                        Section {i + 1}. The body scrolls within a max height of 90 dvh while the header
                        and footer stay pinned. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                ))}
            </div>
        ),
    },
}
