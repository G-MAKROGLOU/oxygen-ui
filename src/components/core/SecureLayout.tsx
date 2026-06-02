import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface SecureLayoutProps {
    /** Protected content, rendered only once access is granted. */
    children: React.ReactNode

    /**
     * Whether the user is authenticated. If omitted and `token` is given,
     * authentication is inferred from the token's validity (non-expired).
     * If both are omitted, the user is treated as authenticated and only the
     * role / permission / `canAccess` gates apply.
     */
    isAuthenticated?: boolean
    /** A JWT. Used only to check expiry (`exp`) client-side — never trust this
     *  for real authorization; the server must verify the signature. */
    token?: string

    /** The user's roles (RBAC). */
    roles?: string[]
    /** Required role(s). User needs one (or all, with `requireAllRoles`). */
    requiredRoles?: string[]
    requireAllRoles?: boolean

    /** The user's permissions (PBAC). */
    permissions?: string[]
    /** Required permission(s). One needed (or all, with `requireAllPermissions`). */
    requiredPermissions?: string[]
    requireAllPermissions?: boolean

    /**
     * The current route path (e.g. `location.pathname`). Pass it from your
     * router to do **per-route** access from a single root wrapper: the check
     * re-runs whenever `route` changes (i.e. on navigation), and the value is
     * forwarded to `canAccess`. Omit it for a static, app-wide gate.
     */
    route?: string

    /**
     * Final say. Runs after the built-in checks; may be async; return false to
     * deny. Receives the current `route`, so a single wrapper can decide access
     * per path (e.g. consult a route → permissions map). Keep it synchronous
     * for instant, flash-free per-route guarding.
     */
    canAccess?: (route?: string) => boolean | Promise<boolean>

    /** Shown while the (possibly async) check resolves. Pass `null` to render nothing. */
    loadingFallback?: React.ReactNode
    /** Shown when access is denied. Defaults to a simple "Access denied" panel;
     *  pass `null` to render nothing (e.g. when `onDeny` redirects away). */
    fallback?: React.ReactNode
    /** Fired once when access is granted — e.g. to hydrate app state or redirect
     *  to a landing route after a successful token check. */
    onGranted?: () => void
    /** Fired once when access is denied — e.g. to redirect to login / logout. */
    onDeny?: () => void

    className?: string
}

/** Decode a JWT payload (no signature check). Returns null if unparseable. */
function parseJwt(token: string): Record<string, unknown> | null {
    try {
        const part = token.split('.')[1]
        if (!part || typeof atob === 'undefined') return null
        const json = decodeURIComponent(
            atob(part.replace(/-/g, '+').replace(/_/g, '/'))
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
        )
        return JSON.parse(json)
    } catch {
        return null
    }
}

/** True if the token is absent of an `exp` claim or that claim is in the future. */
function tokenValid(token: string): boolean {
    const payload = parseJwt(token)
    if (!payload) return false
    const exp = typeof payload.exp === 'number' ? payload.exp : null
    if (exp == null) return true // can't determine expiry → don't block on it
    return exp * 1000 > Date.now()
}

const has = (have: string[] | undefined, need: string[], all: boolean | undefined) =>
    all ? need.every((n) => have?.includes(n)) : need.some((n) => have?.includes(n))

const Spinner = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6 animate-spin text-accent">
        <path fillRule="evenodd" clipRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" />
    </svg>
)

/**
 * A layout wrapper that gates its children behind an access check —
 * authentication, RBAC (roles), PBAC (permissions), JWT expiry, and/or a
 * custom (optionally async) predicate. While the check runs it shows a
 * loading fallback; on success it fades the content in; on failure it renders
 * a fallback and calls `onDeny`.
 *
 * This is a UI guard, not a security boundary — it controls what renders.
 * Real authorization must be enforced by your API/server.
 *
 * @example Full RBAC + PBAC gate
 * <SecureLayout token={jwt} requiredRoles={['admin']} permissions={user.perms}
 *   requiredPermissions={['reports:read']} onDeny={() => navigate('/login')}>
 *   <AdminDashboard />
 * </SecureLayout>
 *
 * @example Simple JWT-only gate with a token-login bootstrap (no roles/perms)
 * <SecureLayout
 *   canAccess={async () => {
 *     const jwt = localStorage.getItem('jwt')
 *     if (!jwt) return false
 *     await tokenLogin(jwt)            // hydrate app state from the server
 *     return true
 *   }}
 *   onGranted={() => navigate('/dashboard')}
 *   onDeny={() => navigate('/logout')}
 *   fallback={null}                    // redirecting — don't flash a panel
 * >
 *   <AppRoutes />
 * </SecureLayout>
 *
 * @example Per-route access from a single root wrapper
 * // Pass the path so the check re-runs on navigation; decide per route.
 * const allowed = { '/admin': ['admin'], '/reports': ['analyst', 'admin'] }
 * <SecureLayout
 *   route={location.pathname}
 *   canAccess={(path) => (allowed[path] ?? []).some((r) => user.roles.includes(r))}
 *   onDeny={() => navigate('/403')}
 * >
 *   <AppRoutes />
 * </SecureLayout>
 */
export default function SecureLayout({
    children,
    isAuthenticated,
    token,
    roles,
    requiredRoles,
    requireAllRoles,
    permissions,
    requiredPermissions,
    requireAllPermissions,
    route,
    canAccess,
    loadingFallback,
    fallback,
    onGranted,
    onDeny,
    className = '',
}: SecureLayoutProps) {
    const reduced = useReducedMotion()

    // Hold the callbacks in a ref so the check effect does NOT depend on their
    // identity — otherwise an inline `canAccess` (the common case) would re-run
    // the check (and re-fire any request inside it) on every parent render.
    const cbs = useRef({ canAccess, onGranted, onDeny })
    cbs.current = { canAccess, onGranted, onDeny }

    // Serialise array inputs so the effect re-runs on value (not identity) changes.
    const rolesKey = JSON.stringify(roles)
    const requiredRolesKey = JSON.stringify(requiredRoles)
    const permissionsKey = JSON.stringify(permissions)
    const requiredPermissionsKey = JSON.stringify(requiredPermissions)

    // The synchronous gates (everything except the async `canAccess`). Kept in
    // a function so both the lazy initial state and the effect agree.
    const passesSync = (): boolean => {
        let authed = isAuthenticated
        if (authed === undefined && token !== undefined) authed = tokenValid(token)
        if (authed === undefined) authed = true
        if (!authed) return false
        if (requiredRoles?.length && !has(roles, requiredRoles, requireAllRoles)) return false
        if (requiredPermissions?.length && !has(permissions, requiredPermissions, requireAllPermissions)) return false
        return true
    }

    // Resolve the first render synchronously when we can, so a plain (JWT / role)
    // gate doesn't flash a spinner on every page load. Only an async `canAccess`
    // forces a 'checking' state.
    const [state, setState] = useState<'checking' | 'granted' | 'denied'>(() =>
        !passesSync() ? 'denied' : canAccess ? 'checking' : 'granted',
    )

    useEffect(() => {
        let cancelled = false
        const { canAccess: check, onGranted: granted, onDeny: deny } = cbs.current
        const finish = (ok: boolean) => {
            if (cancelled) return
            setState(ok ? 'granted' : 'denied')
            if (ok) granted?.()
            else deny?.()
        }

        if (!passesSync()) {
            finish(false)
        } else if (!check) {
            finish(true)
        } else {
            const result = check(route)
            // Only enter the 'checking' state for a genuine promise — a
            // synchronous canAccess resolves in place, so per-route guarding
            // with an in-memory map never flashes a loading state on navigation.
            if (result && typeof (result as Promise<boolean>).then === 'function') {
                setState('checking')
                ;(result as Promise<boolean>).then((ok) => finish(Boolean(ok)))
            } else {
                finish(Boolean(result))
            }
        }

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isAuthenticated,
        token,
        route,
        requireAllRoles,
        requireAllPermissions,
        rolesKey,
        requiredRolesKey,
        permissionsKey,
        requiredPermissionsKey,
    ])

    if (state === 'checking') {
        // `loadingFallback={null}` → render nothing while checking.
        if (loadingFallback === null) return null
        return (
            <div className={['flex min-h-[8rem] items-center justify-center', className].filter(Boolean).join(' ')}>
                {loadingFallback !== undefined ? loadingFallback : <Spinner />}
            </div>
        )
    }

    if (state === 'denied') {
        // `fallback={null}` → render nothing (e.g. when onDeny redirects away).
        if (fallback === null) return null
        return (
            <div className={className || undefined}>
                {fallback !== undefined ? fallback : (
                    <div className="flex min-h-[8rem] flex-col items-center justify-center gap-1 rounded-xl border border-border bg-surface p-8 text-center">
                        <div className="text-sm font-semibold text-foreground">Access denied</div>
                        <div className="text-xs text-foreground-muted">You don’t have permission to view this content.</div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <motion.div
            className={className || undefined}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    )
}
