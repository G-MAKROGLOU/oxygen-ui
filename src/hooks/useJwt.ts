import { useEffect, useMemo, useState } from 'react'

export interface JwtResult<T> {
    /** Decoded claims (payload), or `null` if absent / unparseable. */
    payload: T | null
    /** Decoded header, or `null`. */
    header: Record<string, unknown> | null
    /** Expiry as a Date (from the `exp` claim), or `null` if none. */
    expiresAt: Date | null
    /** True once `exp` is in the past. `false` when there's no `exp`. */
    isExpired: boolean
    /** Parseable payload AND not expired. */
    isValid: boolean
    /** The original token. */
    raw: string | null
}

/** Decode a base64url JWT segment to an object. No signature verification. */
function decodeSegment(seg?: string): Record<string, unknown> | null {
    if (!seg || typeof atob === 'undefined') return null
    try {
        const json = decodeURIComponent(
            atob(seg.replace(/-/g, '+').replace(/_/g, '/'))
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
        )
        return JSON.parse(json)
    } catch {
        return null
    }
}

/**
 * Decode a JWT client-side and track its expiry reactively. The hook
 * re-renders exactly when the token crosses its `exp`, so `isExpired` / `isValid`
 * flip on their own without polling.
 *
 * Decodes only — it never verifies the signature. Treat the result as a UI hint;
 * real authorization belongs on the server. Pairs with `SecureLayout`.
 *
 * @example
 * const { payload, isValid, expiresAt } = useJwt(token)
 * if (!isValid) redirectToLogin()
 */
export function useJwt<T = Record<string, unknown>>(token: string | null | undefined): JwtResult<T> {
    // Bumped by a timer at expiry to force a re-evaluation.
    const [, tick] = useState(0)

    const decoded = useMemo(() => {
        if (!token) return { payload: null as T | null, header: null as Record<string, unknown> | null, exp: null as number | null }
        const [h, p] = token.split('.')
        const header = decodeSegment(h)
        const payload = decodeSegment(p)
        const exp = payload && typeof payload.exp === 'number' ? (payload.exp as number) : null
        return { payload: (payload as T | null), header, exp }
    }, [token])

    // Schedule a single re-render right after the token expires.
    useEffect(() => {
        if (decoded.exp == null) return
        const ms = decoded.exp * 1000 - Date.now()
        if (ms <= 0) return
        const id = setTimeout(() => tick((n) => n + 1), ms + 50)
        return () => clearTimeout(id)
    }, [decoded.exp])

    const expiresAt = decoded.exp != null ? new Date(decoded.exp * 1000) : null
    const isExpired = decoded.exp != null ? decoded.exp * 1000 <= Date.now() : false
    const isValid = decoded.payload != null && !isExpired

    return { payload: decoded.payload, header: decoded.header, expiresAt, isExpired, isValid, raw: token ?? null }
}
