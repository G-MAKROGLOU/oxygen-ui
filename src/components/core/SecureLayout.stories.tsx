import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import SecureLayout from './SecureLayout'
import Button from '../inputs/Button'

const meta: Meta<typeof SecureLayout> = {
    title: 'Layout/SecureLayout',
    component: SecureLayout,
    parameters: { layout: 'padded' },
    // SecureLayout *calls* onGranted/onDeny during its access check; explicit
    // spies avoid Storybook's implicit-action-arg render error (argTypesRegex).
    args: { onGranted: fn(), onDeny: fn() },
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

export const TokenLoginBootstrap: Story = {
    name: 'JWT bootstrap (token-login)',
    render: () => {
        const [log, setLog] = useState<string[]>([])
        const add = (m: string) => setLog((l) => [...l, m])
        return (
            <div className="flex flex-col gap-3">
                <SecureLayout
                    // The "dumb" path: a JWT-only gate that bootstraps app state.
                    canAccess={async () => {
                        add('checking jwt → calling /token-login…')
                        await new Promise((r) => setTimeout(r, 1100))
                        add('token-login ok → hydrated app state')
                        return true
                    }}
                    onGranted={() => add('onGranted → navigate(/dashboard)')}
                    onDeny={() => add('onDeny → navigate(/logout)')}
                >
                    {Protected}
                </SecureLayout>
                <pre className="rounded-lg border border-border bg-surface-raised p-3 text-[11px] leading-relaxed text-foreground-secondary">
                    {log.map((l, i) => `${i + 1}. ${l}`).join('\n') || 'waiting…'}
                </pre>
            </div>
        )
    },
}

export const PerRouteSingleWrapper: Story = {
    name: 'Per-route (single wrapper)',
    render: () => {
        // Pretend router. One SecureLayout wraps everything; `route` drives the check.
        const [route, setRoute] = useState('/dashboard')
        const userRoles = ['analyst']
        const allowed: Record<string, string[]> = {
            '/dashboard': [],                 // public to any signed-in user
            '/reports': ['analyst', 'admin'],
            '/admin': ['admin'],
        }
        const tabBtn = (path: string) =>
            <button key={path} type="button" onClick={() => setRoute(path)}
                className={`rounded-md px-3 py-1.5 text-sm ${route === path ? 'bg-accent text-accent-fg' : 'bg-surface-raised text-foreground-secondary'}`}>
                {path}
            </button>
        return (
            <div className="flex flex-col gap-4">
                <div className="flex gap-2">{['/dashboard', '/reports', '/admin'].map(tabBtn)}</div>
                <SecureLayout
                    route={route}
                    canAccess={(path) => (allowed[path ?? ''] ?? []).length === 0 || (allowed[path ?? ''] ?? []).some((r) => userRoles.includes(r))}
                    fallback={
                        <div className="rounded-xl border border-border bg-surface p-8 text-center">
                            <div className="text-sm font-semibold text-foreground">403 — no access to {route}</div>
                            <div className="mt-1 text-xs text-foreground-muted">Your roles: {userRoles.join(', ')}</div>
                        </div>
                    }
                >
                    <div className="rounded-xl border border-border bg-surface p-8 text-center">
                        <div className="text-sm font-semibold text-foreground">✅ {route}</div>
                        <div className="mt-1 text-xs text-foreground-muted">You have access to this route.</div>
                    </div>
                </SecureLayout>
            </div>
        )
    },
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
