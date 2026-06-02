import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMediaQuery, useBreakpoint } from './useMediaQuery'

// jsdom has no matchMedia — install a controllable mock.
type Listener = () => void
let width = 1000
const lists = new Set<{ q: string; ls: Set<Listener>; mql: { matches: boolean; addEventListener: (t: string, l: Listener) => void; removeEventListener: (t: string, l: Listener) => void } }>()

const parseMin = (q: string) => {
    const m = q.match(/min-width:\s*(\d+)px/)
    return m ? Number(m[1]) : 0
}

beforeEach(() => {
    width = 1000
    lists.clear()
    window.matchMedia = vi.fn((q: string) => {
        const ls = new Set<Listener>()
        const mql = {
            get matches() { return width >= parseMin(q) },
            media: q,
            addEventListener: (_t: string, l: Listener) => ls.add(l),
            removeEventListener: (_t: string, l: Listener) => ls.delete(l),
        } as unknown as MediaQueryList
        lists.add({ q, ls, mql: mql as never })
        return mql
    }) as unknown as typeof window.matchMedia
})

const setWidth = (w: number) => {
    width = w
    act(() => { lists.forEach((entry) => entry.ls.forEach((l) => l())) })
}

describe('useMediaQuery', () => {
    it('reports the current match and reacts to changes', () => {
        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
        expect(result.current).toBe(true) // 1000 >= 768
        setWidth(500)
        expect(result.current).toBe(false)
        setWidth(800)
        expect(result.current).toBe(true)
    })
})

describe('useBreakpoint', () => {
    it('derives the active breakpoint', () => {
        const { result } = renderHook(() => useBreakpoint())
        expect(result.current.active).toBe('lg') // 1000 → ≥976 lg, <1440 xl
        expect(result.current.md).toBe(true)
        expect(result.current.xl).toBe(false)
        setWidth(400)
        expect(result.current.active).toBe('base')
        setWidth(1600)
        expect(result.current.active).toBe('xl')
    })
})
