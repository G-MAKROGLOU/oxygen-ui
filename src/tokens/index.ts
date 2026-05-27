/**
 * @geomak/ui — Design Tokens
 *
 * Three layers:
 *
 *  1. `palette`  — raw brand colors from colors.ts (hex literals)
 *  2. `semanticTokens` — resolved hex values per light/dark mode
 *  3. `vars` — CSS custom-property references for inline styles / CSS-in-JS
 *
 * CSS custom properties are injected by importing '@geomak/ui/styles'.
 * Tailwind semantic utilities (bg-background, text-foreground, etc.) are
 * available after the consumer includes the package's tailwind preset.
 */

export { PALETTE as palette } from '../utils/colors'

// ─── Resolved values ──────────────────────────────────────────────────────────

/**
 * Resolved hex/rgba values for every semantic token, keyed by `light` / `dark`.
 * Use these when CSS custom properties aren't available (canvas, email, SSR snapshots).
 */
export const semanticTokens = {
    light: {
        // Surfaces
        background:          '#DBF1FD', // ice        — page-level background
        surface:             '#ffffff', // white      — panel / card background
        'surface-raised':    '#ffffff', // white      — elevated layer (shadow differentiates)

        // Borders
        border:              '#d0e3ed', // ice-dark   — default separator
        'border-strong':     '#7D8597', // roman-silver — focus rings, strong dividers

        // Text
        foreground:          '#001845', // oxford-blue-800 — primary body text
        'foreground-secondary': '#33415C', // independence   — labels, captions
        'foreground-muted':  '#5C677D', // black-coral     — placeholders, helper text

        // Accent (interactive)
        accent:              '#0466C8', // true-blue
        'accent-hover':      '#0353A4', // usafa-blue (darker → lower on dark scale)
        'accent-foreground': '#ffffff', // text on accent backgrounds

        // Status
        error:               '#e03131',
        warning:             '#e67700',
        success:             '#2f9e44',
        info:                '#1971c2',
    },

    dark: {
        // Surfaces
        background:          '#001233', // oxford-blue-900 — deepest app shell
        surface:             '#00273A', // prussian-blue   — cards / panels
        'surface-raised':    '#002855', // oxford-blue-700 — dropdowns, popovers

        // Borders
        border:              '#33415C', // independence
        'border-strong':     '#5C677D', // black-coral

        // Text
        foreground:          '#DBF1FD', // ice (light blue-white — avoids harsh #fff)
        'foreground-secondary': '#979DAC', // manatee
        'foreground-muted':  '#7D8597', // roman-silver

        // Accent (interactive)
        accent:              '#0466C8', // true-blue (same — holds contrast on dark bg)
        'accent-hover':      '#1a80e8', // lighter tint — hover goes up in brightness on dark
        'accent-foreground': '#ffffff',

        // Status (lightened for dark backgrounds — sufficient contrast)
        error:               '#ff6b6b',
        warning:             '#ffa94d',
        success:             '#69db7c',
        info:                '#74c0fc',
    },

    // Mode-independent structure tokens
    shared: {
        'radius-sm':   '4px',
        'radius-md':   '8px',
        'radius-lg':   '12px',
        'radius-xl':   '16px',
        'radius-2xl':  '20px',
        'radius-full': '9999px',
    },
} as const

export type SemanticColorKey   = keyof typeof semanticTokens.light
export type SemanticRadiusKey  = keyof typeof semanticTokens.shared

// ─── CSS custom-property references ──────────────────────────────────────────

/**
 * CSS custom-property reference strings.
 *
 * @example
 * // Inline style — respects light/dark automatically
 * <div style={{ color: vars.color.foreground }}>...</div>
 *
 * @example
 * // CSS-in-JS (Emotion, styled-components)
 * const Card = styled.div`
 *   background: ${vars.color.surface};
 *   border: 1px solid ${vars.color.border};
 * `
 */
export const vars = {
    color: {
        background:           'var(--color-background)',
        surface:              'var(--color-surface)',
        surfaceRaised:        'var(--color-surface-raised)',
        border:               'var(--color-border)',
        borderStrong:         'var(--color-border-strong)',
        foreground:           'var(--color-foreground)',
        foregroundSecondary:  'var(--color-foreground-secondary)',
        foregroundMuted:      'var(--color-foreground-muted)',
        accent:               'var(--color-accent)',
        accentHover:          'var(--color-accent-hover)',
        accentForeground:     'var(--color-accent-foreground)',
        error:                'var(--color-error)',
        warning:              'var(--color-warning)',
        success:              'var(--color-success)',
        info:                 'var(--color-info)',
    },
    radius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
    },
    shadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
    },
} as const

export type VarColorKey  = keyof typeof vars.color
export type VarRadiusKey = keyof typeof vars.radius
export type VarShadowKey = keyof typeof vars.shadow
