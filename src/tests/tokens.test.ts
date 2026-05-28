import { describe, it, expect } from 'vitest'
import { palette, semanticTokens, vars } from '../tokens'

// ─── palette ─────────────────────────────────────────────────────────────────

describe('palette', () => {
    it('exports the brand accent colour', () => {
        expect(palette['true-blue']).toBe('#0466C8')
    })

    it('contains no undefined values', () => {
        Object.values(palette).forEach((v) => expect(v).toBeDefined())
    })
})

// ─── semanticTokens ───────────────────────────────────────────────────────────

describe('semanticTokens', () => {
    const REQUIRED_KEYS = [
        'background', 'surface', 'surface-raised',
        'border', 'border-strong',
        'foreground', 'foreground-secondary', 'foreground-muted',
        'accent', 'accent-hover', 'accent-foreground',
        'error', 'warning', 'success', 'info',
    ] as const

    it('light mode has all required keys', () => {
        REQUIRED_KEYS.forEach((k) => {
            expect(semanticTokens.light).toHaveProperty(k)
        })
    })

    it('dark mode has all required keys', () => {
        REQUIRED_KEYS.forEach((k) => {
            expect(semanticTokens.dark).toHaveProperty(k)
        })
    })

    it('light and dark accent colours differ', () => {
        expect(semanticTokens.light.accent).not.toBe(semanticTokens.dark.accent)
    })

    it('every value is a non-empty string', () => {
        ;[semanticTokens.light, semanticTokens.dark].forEach((mode) => {
            Object.values(mode).forEach((v) => {
                expect(typeof v).toBe('string')
                expect((v as string).length).toBeGreaterThan(0)
            })
        })
    })
})

// ─── vars ─────────────────────────────────────────────────────────────────────

describe('vars', () => {
    it('color vars reference CSS custom properties', () => {
        expect(vars.color.accent).toBe('var(--color-accent)')
        expect(vars.color.background).toBe('var(--color-background)')
        expect(vars.color.foreground).toBe('var(--color-foreground)')
    })

    it('typography vars reference CSS custom properties', () => {
        expect(vars.typography.fontSizeBase).toBe('var(--font-size-base)')
        expect(vars.typography.fontWeightBold).toBe('var(--font-weight-bold)')
    })

    it('density vars reference CSS custom properties', () => {
        expect(vars.density.controlMd).toBe('var(--height-control-md)')
        expect(vars.density.topbar).toBe('var(--height-topbar)')
    })

    it('motion vars reference CSS custom properties', () => {
        expect(vars.motion.durationNormal).toBe('var(--duration-normal)')
        expect(vars.motion.easeOutExpo).toBe('var(--ease-out-expo)')
    })

    it('zIndex vars reference CSS custom properties', () => {
        expect(vars.zIndex.modal).toBe('var(--z-modal)')
        expect(vars.zIndex.tooltip).toBe('var(--z-tooltip)')
    })
})
