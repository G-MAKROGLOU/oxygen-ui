import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import SecureLayout from './SecureLayout'
import Button from '../inputs/Button'

const meta: Meta<typeof SecureLayout> = {
    title: 'Layout/SecureLayout',
    component: SecureLayout,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof SecureLayout>

const Protected = (
    <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <div className="text-sm font-semibold text-foreground">🔓 Protected content</div>
        <div className="mt-1 text-xs text-foreground-muted">You passed the access check.</div>
    </div>
)

export const Granted: Story = {
    args: { isAuthenticated: true, roles: ['admin'], requiredRoles: ['admin'], children: Protected },
}

export const DeniedByRole: Story = {
    name: 'Denied (missing role)',
    args: { isAuthenticated: true, roles: ['viewer'], requiredRoles: ['admin'], children: Protected },
}

export const DeniedByPermission: Story = {
    name: 'Denied (missing permission)',
    args: {
        isAuthenticated: true,
        permissions: ['reports:read'],
        requiredPermissions: ['reports:write'],
        children: Protected,
    },
}

export const AsyncCheck: Story = {
    name: 'Async canAccess (loading → grant)',
    render: () => (
        <SecureLayout canAccess={() => new Promise((r) => setTimeout(() => r(true), 1200))}>
            {Protected}
        </SecureLayout>
    ),
}

export const ToggleAccess: Story = {
    name: 'Live role toggle',
    render: () => {
        const [admin, setAdmin] = useState(false)
        return (
            <div className="flex flex-col gap-4">
                <Button content={admin ? 'Drop admin role' : 'Grant admin role'} size="sm" onClick={() => setAdmin((a) => !a)} />
                <SecureLayout isAuthenticated roles={admin ? ['admin'] : ['viewer']} requiredRoles={['admin']}>
                    {Protected}
                </SecureLayout>
            </div>
        )
    },
}
