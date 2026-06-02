import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SecureLayout from './SecureLayout'

const Secret = <div>secret content</div>

const makeToken = (payload: Record<string, unknown>) => {
    const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`
}

describe('SecureLayout', () => {
    it('grants when authenticated and required role is present', async () => {
        render(<SecureLayout isAuthenticated roles={['admin']} requiredRoles={['admin']}>{Secret}</SecureLayout>)
        expect(await screen.findByText('secret content')).toBeInTheDocument()
    })

    it('denies (custom fallback) when a required role is missing', async () => {
        render(
            <SecureLayout isAuthenticated roles={['viewer']} requiredRoles={['admin']} fallback={<div>denied</div>}>
                {Secret}
            </SecureLayout>,
        )
        expect(await screen.findByText('denied')).toBeInTheDocument()
        expect(screen.queryByText('secret content')).toBeNull()
    })

    it('honours requireAllPermissions', async () => {
        render(
            <SecureLayout
                isAuthenticated
                permissions={['reports:read']}
                requiredPermissions={['reports:read', 'reports:write']}
                requireAllPermissions
                fallback={<div>denied</div>}
            >
                {Secret}
            </SecureLayout>,
        )
        expect(await screen.findByText('denied')).toBeInTheDocument()
    })

    it('grants via an async canAccess predicate', async () => {
        render(<SecureLayout canAccess={() => Promise.resolve(true)}>{Secret}</SecureLayout>)
        expect(await screen.findByText('secret content')).toBeInTheDocument()
    })

    it('calls onDeny when access is refused', async () => {
        const onDeny = vi.fn()
        render(<SecureLayout canAccess={() => false} onDeny={onDeny} fallback={<div>denied</div>}>{Secret}</SecureLayout>)
        await screen.findByText('denied')
        await waitFor(() => expect(onDeny).toHaveBeenCalledTimes(1))
    })

    it('fires onGranted when access is granted', async () => {
        const onGranted = vi.fn()
        render(<SecureLayout isAuthenticated onGranted={onGranted}>{Secret}</SecureLayout>)
        await screen.findByText('secret content')
        await waitFor(() => expect(onGranted).toHaveBeenCalledTimes(1))
    })

    it('grants synchronously with no spinner flash when there is no async check', () => {
        // No canAccess → decision is synchronous; content is present on first render.
        render(<SecureLayout isAuthenticated roles={['admin']} requiredRoles={['admin']}>{Secret}</SecureLayout>)
        expect(screen.getByText('secret content')).toBeInTheDocument()
    })

    it('renders nothing when denied with fallback={null}', async () => {
        const onDeny = vi.fn()
        const { container } = render(
            <SecureLayout isAuthenticated roles={['viewer']} requiredRoles={['admin']} fallback={null} onDeny={onDeny}>
                {Secret}
            </SecureLayout>,
        )
        await waitFor(() => expect(onDeny).toHaveBeenCalled())
        expect(screen.queryByText('secret content')).toBeNull()
        expect(screen.queryByText(/Access denied/)).toBeNull()
        expect(container).toBeEmptyDOMElement()
    })

    it('treats an expired JWT as unauthenticated', async () => {
        const expired = makeToken({ exp: Math.floor(Date.now() / 1000) - 100 })
        render(<SecureLayout token={expired} fallback={<div>denied</div>}>{Secret}</SecureLayout>)
        expect(await screen.findByText('denied')).toBeInTheDocument()
    })

    it('accepts a non-expired JWT', async () => {
        const valid = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 })
        render(<SecureLayout token={valid}>{Secret}</SecureLayout>)
        expect(await screen.findByText('secret content')).toBeInTheDocument()
    })
})
