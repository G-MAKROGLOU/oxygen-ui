import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Banner from './Banner'
import Button from '../inputs/Button'

const meta: Meta<typeof Banner> = {
    title: 'Feedback/Banner',
    component: Banner,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    argTypes: {
        tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
    },
    decorators: [(Story) => <div className="mx-auto max-w-xl"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Banner>

export const Playground: Story = {
    args: {
        tone: 'info',
        children: 'Toggle a switch on to activate a custom filter. Toggle off to pick a replacement.',
    },
}

export const Tones: Story = {
    render: () => (
        <div className="flex flex-col gap-3">
            <Banner tone="info">A new compliance report is available for download.</Banner>
            <Banner tone="success">Voyage data synced successfully.</Banner>
            <Banner tone="warning">Two vessels are missing noon reports for today.</Banner>
            <Banner tone="danger">Sync failed — your latest changes were not saved.</Banner>
        </div>
    ),
}

export const RichContent: Story = {
    args: {
        tone: 'info',
        children: (
            <>
                If none of the filter switches is enabled, the <strong>default</strong> filters are active.
                Toggle a switch on to activate a custom filter. Toggle off to pick a replacement.
            </>
        ),
    },
}

export const Dismissible: Story = {
    render: () => {
        const Demo = () => {
            const [shown, setShown] = useState(true)
            return shown ? (
                <Banner tone="warning" onDismiss={() => setShown(false)}>
                    Your session expires in 5 minutes. Save your work.
                </Banner>
            ) : (
                <Button content="Show banner again" size="sm" variant="outline" onClick={() => setShown(true)} />
            )
        }
        return <Demo />
    },
}
