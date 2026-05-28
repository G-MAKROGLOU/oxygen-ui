import React, { useEffect, useMemo, useRef } from 'react'

// ─── Theme config types ───────────────────────────────────────────────────────

export interface ThemeColors {
    background?:           string
    surface?:              string
    'surface-raised'?:     string
    border?:               string
    'border-strong'?:      string
    foreground?:           string
    'foreground-secondary'?: string
    'foreground-muted'?:   string
    accent?:               string
    'accent-hover'?:       string
    'accent-foreground'?:  string
    error?:                string
    warning?:              string
    success?:              string
    info?:                 string
}

export interface ThemeRadius {
    sm?:    string | number
    md?:    string | number
    lg?:    string | number
    xl?:    string | number
    '2xl'?: string | number
    full?:  string | number
}

export interface ThemeShadows {
    sm?: string
    md?: string
    lg?: string
    xl?: string
}

export interface ThemeTypography {
    /** e.g. '"Geist", sans-serif' */
    fontFamily?:       string
    fontSizeXs?:       string
    fontSizeSm?:       string
    fontSizeBase?:     string
    fontSizeLg?:       string
    fontSizeXl?:       string
    fontSize2xl?:      string
    fontSize3xl?:      string
    fontWeightNormal?:   number | string
    fontWeightMedium?:   number | string
    fontWeightSemibold?: number | string
    fontWeightBold?:     number | string
    lineHeightTight?:   number | string
    lineHeightSnug?:    number | string
    lineHeightNormal?:  number | string
    lineHeightRelaxed?: number | string
}

export interface ThemeDensity {
    /** Height of xs control (icon buttons, tiny chips). Default: 24px */
    controlXs?: string | number
    /** Height of sm control (small inputs/buttons). Default: 28px */
    controlSm?: string | number
    /** Height of md control (default inputs/buttons). Default: 36px */
    controlMd?: string | number
    /** Height of lg control (large touch targets). Default: 44px */
    controlLg?: string | number
    /** TopBar height. Default: 56px */
    topbar?:    string | number
}

export interface ThemeMotion {
    durationFast?:   string
    durationNormal?: string
    durationSlow?:   string
    durationGentle?: string
}

/**
 * Partial theme override configuration.
 * Every field is optional — only the keys you provide are overridden.
 */
export interface ThemeConfig {
    colors?:     ThemeColors
    radius?:     ThemeRadius
    shadows?:    ThemeShadows
    typography?: ThemeTypography
    density?:    ThemeDensity
    motion?:     ThemeMotion
}

export interface ThemeProviderProps {
    /**
     * Token overrides applied in both light and dark mode (on top of the defaults).
     * For dark-specific overrides see `darkTheme`.
     */
    theme?: ThemeConfig

    /**
     * Additional token overrides applied only when the wrapper element carries
     * the `.dark` class (i.e. when `colorScheme="dark"` or when a parent sets `.dark`).
     * Injected via a scoped `<style>` tag — no inline-style limitations.
     */
    darkTheme?: ThemeConfig

    /**
     * Managed color scheme.
     * - `'light'`  — removes `.dark` class from the wrapper
     * - `'dark'`   — adds `.dark` class to the wrapper
     * - `'system'` — follows `prefers-color-scheme` media query
     * - `'auto'`   — do nothing; inherit from an ancestor (default)
     */
    colorScheme?: 'light' | 'dark' | 'system' | 'auto'

    children:   React.ReactNode
    className?: string
    style?:     React.CSSProperties
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function px(v: string | number): string {
    return typeof v === 'number' ? `${v}px` : v
}

function str(v: string | number | undefined): string | undefined {
    return v == null ? undefined : String(v)
}

function toCssVars(theme?: ThemeConfig): Record<string, string> {
    if (!theme) return {}
    const out: Record<string, string> = {}

    if (theme.colors) {
        for (const [k, v] of Object.entries(theme.colors)) {
            if (v != null) out[`--color-${k}`] = v
        }
    }
    if (theme.radius) {
        for (const [k, v] of Object.entries(theme.radius)) {
            if (v != null) out[`--radius-${k}`] = px(v)
        }
    }
    if (theme.shadows) {
        for (const [k, v] of Object.entries(theme.shadows)) {
            if (v != null) out[`--shadow-${k}`] = v
        }
    }
    if (theme.typography) {
        const t = theme.typography
        const map: [string, string | number | undefined][] = [
            ['--font-family-sans',       t.fontFamily],
            ['--font-size-xs',           t.fontSizeXs],
            ['--font-size-sm',           t.fontSizeSm],
            ['--font-size-base',         t.fontSizeBase],
            ['--font-size-lg',           t.fontSizeLg],
            ['--font-size-xl',           t.fontSizeXl],
            ['--font-size-2xl',          t.fontSize2xl],
            ['--font-size-3xl',          t.fontSize3xl],
            ['--font-weight-normal',     t.fontWeightNormal],
            ['--font-weight-medium',     t.fontWeightMedium],
            ['--font-weight-semibold',   t.fontWeightSemibold],
            ['--font-weight-bold',       t.fontWeightBold],
            ['--line-height-tight',      t.lineHeightTight],
            ['--line-height-snug',       t.lineHeightSnug],
            ['--line-height-normal',     t.lineHeightNormal],
            ['--line-height-relaxed',    t.lineHeightRelaxed],
        ]
        for (const [cssVar, val] of map) {
            const s = str(val)
            if (s != null) out[cssVar] = s
        }
    }
    if (theme.density) {
        const d = theme.density
        const map: [string, string | number | undefined][] = [
            ['--height-control-xs', d.controlXs],
            ['--height-control-sm', d.controlSm],
            ['--height-control-md', d.controlMd],
            ['--height-control-lg', d.controlLg],
            ['--height-topbar',     d.topbar],
        ]
        for (const [cssVar, val] of map) {
            if (val != null) out[cssVar] = px(val)
        }
    }
    if (theme.motion) {
        const m = theme.motion
        const map: [string, string | undefined][] = [
            ['--duration-fast',   m.durationFast],
            ['--duration-normal', m.durationNormal],
            ['--duration-slow',   m.durationSlow],
            ['--duration-gentle', m.durationGentle],
        ]
        for (const [cssVar, val] of map) {
            if (val != null) out[cssVar] = val
        }
    }

    return out
}

function varsToStyleString(vars: Record<string, string>): string {
    return Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join(' ')
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Scoped theme provider.
 *
 * Wraps children in a `<div>` that carries CSS custom-property overrides
 * as inline styles. A scoped `<style>` tag handles dark-mode overrides.
 *
 * @example Basic brand color swap
 * <ThemeProvider theme={{ colors: { accent: '#e63946', 'accent-hover': '#c1121f' } }}>
 *   <App />
 * </ThemeProvider>
 *
 * @example Compact density + custom font
 * <ThemeProvider
 *   theme={{
 *     density:    { controlMd: 30, controlLg: 38, topbar: 48 },
 *     typography: { fontFamily: '"Geist", sans-serif' },
 *   }}
 * >
 *   <Dashboard />
 * </ThemeProvider>
 *
 * @example Managed dark mode
 * <ThemeProvider
 *   colorScheme="dark"
 *   theme={{ colors: { accent: '#60a5fa' } }}
 *   darkTheme={{ colors: { accent: '#93c5fd' } }}
 * >
 *   <App />
 * </ThemeProvider>
 */
export default function ThemeProvider({
    theme,
    darkTheme,
    colorScheme = 'auto',
    children,
    className = '',
    style,
}: ThemeProviderProps) {
    const id       = React.useId().replace(/:/g, '')
    const scopeClass = `geo-th-${id}`

    const divRef = useRef<HTMLDivElement>(null)

    // ── Managed color scheme ─────────────────────────────────────────────────
    useEffect(() => {
        const el = divRef.current
        if (!el) return

        if (colorScheme === 'auto') return

        if (colorScheme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)')
            const apply = (e: MediaQueryListEvent | MediaQueryList) => {
                el.classList.toggle('dark', e.matches)
            }
            apply(mq)
            mq.addEventListener('change', apply)
            return () => mq.removeEventListener('change', apply)
        }

        el.classList.toggle('dark', colorScheme === 'dark')
    }, [colorScheme])

    // ── Inline CSS vars (light + always-on overrides) ────────────────────────
    const lightVars = useMemo(() => toCssVars(theme), [theme])

    // ── Scoped dark-mode override via injected <style> ───────────────────────
    const darkVarStr = useMemo(() => {
        if (!darkTheme) return ''
        const dvars = toCssVars(darkTheme)
        if (!Object.keys(dvars).length) return ''
        return `.${scopeClass}.dark { ${varsToStyleString(dvars)} }`
    // scopeClass is stable (derived from useId); only darkTheme matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [darkTheme])

    return (
        <>
            {darkVarStr && (
                <style dangerouslySetInnerHTML={{ __html: darkVarStr }} />
            )}
            <div
                ref={divRef}
                className={`${scopeClass} ${className}`.trim()}
                style={{ ...(lightVars as React.CSSProperties), ...style }}
            >
                {children}
            </div>
        </>
    )
}
