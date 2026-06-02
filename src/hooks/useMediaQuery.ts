import { useEffect, useState } from 'react'

/**
 * Track a CSS media query reactively. SSR-safe (returns `false` until mounted /
 * when `matchMedia` is unavailable) and updates as the match changes.
 *
 * @example
 * const isWide = useMediaQuery('(min-width: 1024px)')
 * const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
 * const dark = useMediaQuery('(prefers-color-scheme: dark)')
 */
export function useMediaQuery(query: string): boolean {
    const get = () =>
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            ? window.matchMedia(query).matches
            : false

    const [matches, setMatches] = useState<boolean>(get)

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
        const mql = window.matchMedia(query)
        const onChange = () => setMatches(mql.matches)
        onChange() // sync in case it changed between render and effect
        mql.addEventListener('change', onChange)
        return () => mql.removeEventListener('change', onChange)
    }, [query])

    return matches
}

// Min-width breakpoints — kept in sync with tailwind.config.cjs `screens`.
const BREAKPOINTS = { sm: 480, md: 768, lg: 976, xl: 1440 } as const
export type Breakpoint = keyof typeof BREAKPOINTS

export interface BreakpointState {
    /** ≥ 480px */ sm: boolean
    /** ≥ 768px */ md: boolean
    /** ≥ 976px */ lg: boolean
    /** ≥ 1440px */ xl: boolean
    /** The largest matched breakpoint, or `'base'` below `sm`. */
    active: 'base' | Breakpoint
}

/**
 * Reactive view of the library's responsive breakpoints (matching the Tailwind
 * `screens`). Each flag is a min-width match; `active` is the largest one met.
 *
 * @example
 * const { md, active } = useBreakpoint()
 * if (!md) return <MobileNav />     // below 768px
 */
export function useBreakpoint(): BreakpointState {
    const sm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`)
    const md = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`)
    const lg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`)
    const xl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`)
    const active: 'base' | Breakpoint = xl ? 'xl' : lg ? 'lg' : md ? 'md' : sm ? 'sm' : 'base'
    return { sm, md, lg, xl, active }
}
