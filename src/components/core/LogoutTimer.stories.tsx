import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import LogoutTimer from './LogoutTimer'

const meta: Meta<typeof LogoutTimer> = {
    title: 'Feedback/LogoutTimer',
    component: LogoutTimer,
    parameters: { layout: 'centered' },
    argTypes: {
        timeout: { control: { type: 'number' } },
        countdown: { control: { type: 'number' } },
        enabled: { control: 'boolean' },
    },
}
export default meta
type Story = StoryObj<typeof LogoutTimer>

/**
 * Short timings so you can watch it work: warns after 3s idle, then a 10s
 * countdown. Stop moving the mouse / typing over the canvas and wait.
 */
export const Default: Story = {
    args: { timeout: 3000, countdown: 10000, enabled: true },
    render: (args) => {
        const [event, setEvent] = useState('Idle, stop interacting and wait 3s for the warning…')
        return (
            <div className="flex flex-col items-center gap-3" style={{ width: 360 }}>
                <div className="rounded-lg border border-border bg-surface px-4 py-3 text-center text-sm text-foreground-secondary">
                    {event}
                </div>
                <LogoutTimer
                    {...args}
                    onWarning={() => setEvent('⚠️ Warning shown, choose an option.')}
                    onContinue={() => setEvent('✅ Stayed signed in, idle timer reset.')}
                    onLogout={() => setEvent('🔒 Logged out (onLogout fired).')}
                />
            </div>
        )
    },
}

export const Disabled: Story = {
    args: { timeout: 3000, countdown: 10000, enabled: false },
    render: (args) => (
        <div style={{ width: 360 }} className="rounded-lg border border-border bg-surface px-4 py-3 text-center text-sm text-foreground-muted">
            Timer disabled, no warning will appear.
            <LogoutTimer {...args} onLogout={() => {}} />
        </div>
    ),
}
