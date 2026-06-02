import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import CookieConsent from './CookieConsent'
import Button from '../inputs/Button'

const meta: Meta<typeof CookieConsent> = {
    title: 'Marketing/CookieConsent',
    component: CookieConsent,
    parameters: { layout: 'fullscreen' },
    argTypes: {
        position: { control: 'inline-radio', options: ['bottom', 'bottom-left', 'bottom-right'] },
    },
}
export default meta
type Story = StoryObj<typeof CookieConsent>

// Stories disable persistence (storageKey={null}) + force `open` so the banner
// always shows in the canvas regardless of prior choices.
export const Default: Story = {
    args: {
        open: true,
        storageKey: null,
        title: 'Cookies',
        message: 'We use cookies to enhance your experience, analyse traffic, and personalise content.',
        learnMoreHref: '#',
    },
}

export const WithDecline: Story = {
    args: { ...Default.args, declineLabel: 'Reject non-essential' },
}

export const BottomRight: Story = {
    args: { ...Default.args, position: 'bottom-right', declineLabel: 'Reject' },
}

export const SelfManaging: Story = {
    name: 'Self-managing (localStorage)',
    render: () => {
        const KEY = 'oxygen-cookie-demo'
        const [, force] = useState(0)
        return (
            <div className="p-10">
                <p className="mb-4 max-w-md text-sm text-foreground-secondary">
                    This instance persists the choice under <code>{KEY}</code>. Accept/reject, then refresh — it stays dismissed. Use the button to clear and show it again.
                </p>
                <Button variant="outline" content="Reset consent" onClick={() => { window.localStorage.removeItem(KEY); force((n) => n + 1) }} />
                <CookieConsent storageKey={KEY} declineLabel="Reject" learnMoreHref="#" />
            </div>
        )
    },
}
