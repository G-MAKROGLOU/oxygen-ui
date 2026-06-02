import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useJwt } from './useJwt'

const makeToken = (payload: Record<string, unknown>) => {
    const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.sig`
}

describe('useJwt', () => {
    it('returns nulls for an empty token', () => {
        const { result } = renderHook(() => useJwt(null))
        expect(result.current.payload).toBeNull()
        expect(result.current.isValid).toBe(false)
        expect(result.current.isExpired).toBe(false)
    })

    it('decodes the payload and header', () => {
        const token = makeToken({ sub: 'u1', name: 'Ada', exp: Math.floor(Date.now() / 1000) + 3600 })
        const { result } = renderHook(() => useJwt<{ sub: string; name: string }>(token))
        expect(result.current.payload?.sub).toBe('u1')
        expect(result.current.payload?.name).toBe('Ada')
        expect(result.current.header?.alg).toBe('HS256')
    })

    it('flags a valid, non-expired token', () => {
        const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 })
        const { result } = renderHook(() => useJwt(token))
        expect(result.current.isExpired).toBe(false)
        expect(result.current.isValid).toBe(true)
        expect(result.current.expiresAt).toBeInstanceOf(Date)
    })

    it('flags an expired token', () => {
        const token = makeToken({ exp: Math.floor(Date.now() / 1000) - 100 })
        const { result } = renderHook(() => useJwt(token))
        expect(result.current.isExpired).toBe(true)
        expect(result.current.isValid).toBe(false)
    })

    it('treats a token without exp as non-expired but still decodable', () => {
        const token = makeToken({ sub: 'u2' })
        const { result } = renderHook(() => useJwt(token))
        expect(result.current.isExpired).toBe(false)
        expect(result.current.expiresAt).toBeNull()
        expect(result.current.isValid).toBe(true)
    })

    it('returns null payload for a malformed token', () => {
        const { result } = renderHook(() => useJwt('not-a-jwt'))
        expect(result.current.payload).toBeNull()
        expect(result.current.isValid).toBe(false)
    })
})
