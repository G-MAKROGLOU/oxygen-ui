import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import LeadCapture from './LeadCapture'

const meta: Meta<typeof LeadCapture> = {
    title: 'Marketing/LeadCapture',
    component: LeadCapture,
    parameters: { layout: 'fullscreen' },
    argTypes: {
        background: { control: 'inline-radio', options: ['surface', 'gradient'] },
        centered: { control: 'boolean' },
    },
    decorators: [(Story) => <div className="p-6"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof LeadCapture>

export const FooterCTA: Story = {
    args: {
        title: 'Stay in the loop',
        description: 'Product updates and maritime insights, once a month. No noise.',
        buttonLabel: 'Subscribe',
        note: 'We respect your inbox. Unsubscribe anytime.',
        onSubmit: (email) => console.log('subscribe', email),
    },
}

export const OnSurface: Story = {
    args: { ...FooterCTA.args, background: 'surface' },
}

export const LeftAligned: Story = {
    args: { ...FooterCTA.args, centered: false },
}

export const CustomSuccess: Story = {
    args: {
        ...FooterCTA.args,
        title: 'Request early access',
        description: 'Be first to try the new voyage planner.',
        buttonLabel: 'Request access',
        successMessage: 'You’re on the waitlist — we’ll be in touch.',
    },
}
