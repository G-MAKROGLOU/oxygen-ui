import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
    beforeEach(() => window.localStorage.clear())

    it('returns the initial value when nothing is stored', () => {
        const { result } = renderHook(() => useLocalStorage('k', 'init'))
        expect(result.current[0]).toBe('init')
    })

    it('reads an existing stored value', () => {
        window.localStorage.setItem('k', JSON.stringify('saved'))
        const { result } = renderHook(() => useLocalStorage('k', 'init'))
        expect(result.current[0]).toBe('saved')
    })

    it('persists updates (value and updater forms)', () => {
        const { result } = renderHook(() => useLocalStorage<number>('count', 0))
        act(() => result.current[1](5))
        expect(result.current[0]).toBe(5)
        expect(JSON.parse(window.localStorage.getItem('count')!)).toBe(5)
        act(() => result.current[1]((n) => n + 1))
        expect(result.current[0]).toBe(6)
    })

    it('remove() clears storage and resets to the initial value', () => {
        const { result } = renderHook(() => useLocalStorage('k', 'init'))
        act(() => result.current[1]('changed'))
        act(() => result.current[2]())
        expect(result.current[0]).toBe('init')
        expect(window.localStorage.getItem('k')).toBeNull()
    })

    it('keeps two hook instances on the same key in sync (same tab)', () => {
        const a = renderHook(() => useLocalStorage('shared', 'x'))
        const b = renderHook(() => useLocalStorage('shared', 'x'))
        act(() => a.result.current[1]('y'))
        expect(b.result.current[0]).toBe('y')
    })
})
