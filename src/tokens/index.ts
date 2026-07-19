/**
 * @geomak/ui, Design Tokens
 *
 * Three layers, each useful in a different context:
 *
 *  1. `palette`       , raw brand hex values from palette.json
 *  2. `semanticTokens`, resolved hex / px values keyed by light / dark / shared
 *  3. `vars`          , CSS custom-property reference strings for inline styles / CSS-in-JS
 *
 * CSS custom properties are injected by: import '@geomak/ui/styles'
 * Tailwind utilities map to these vars via the bundled tailwind preset.
 */

export { PALETTE as palette } from '../utils/colors'

// ─── Resolved values (hex / px / ms) ─────────────────────────────────────────

/**
 * Resolved token values for every semantic role.
 * Use when CSS custom properties aren't available (canvas, email, SSR snapshots).
 */
export const semanticTokens = {
    light: {
        // Surfaces
        background:               '#eef4fa',
        surface:                  '#ffffff',
        'surface-raised':         '#ffffff',
        // Borders
        border:                   '#d3dde8',
        'border-strong':          '#8898aa',
        // Text
        foreground:               '#0a1929',
        'foreground-secondary':   '#2e4057',
        'foreground-muted':       '#536878',
        // Accent
        accent:                   '#0466C8',
        'accent-hover':           '#0353A4',
        'accent-foreground':      '#ffffff',
        // Status
        error:                    '#c0392b',
        warning:                  '#d68910',
        success:                  '#1e8449',
        info:                     '#1565c0',
        // Scrim
        backdrop:                 'rgba(6, 15, 26, 0.45)',
    },

    dark: {
        // Surfaces
        background:               '#060f1a',
        surface:                  '#0d1f30',
        'surface-raised':         '#152638',
        // Borders
        border:                   '#1e3348',
        'border-strong':          '#2e4a64',
        // Text
        foreground:               '#e8f0f8',
        'foreground-secondary':   '#9ab0c4',
        'foreground-muted':       '#5c7a92',
        // Accent
        accent:                   '#2d88ff',
        'accent-hover':           '#4d9aff',
        'accent-foreground':      '#ffffff',
        // Status (brightened for dark backgrounds)
        error:                    '#ff6b6b',
        warning:                  '#ffb347',
        success:                  '#5cb85c',
        info:                     '#5bc0de',
        // Scrim (denser on dark backgrounds)
        backdrop:                 'rgba(0, 0, 0, 0.6)',
    },

    // Mode-independent tokens
    shared: {
        // Radius, enterprise scale
        'radius-sm':    '2px',
        'radius-md':    '5px',
        'radius-lg':    '7px',
        'radius-xl':    '10px',
        'radius-2xl':   '12px',
        'radius-full':  '9999px',

        // Typography
        'font-size-xs':           '0.75rem',
        'font-size-sm':           '0.875rem',
        'font-size-base':         '1rem',
        'font-size-lg':           '1.125rem',
        'font-size-xl':           '1.25rem',
        'font-size-2xl':          '1.5rem',
        'font-size-3xl':          '1.875rem',
        'font-weight-normal':     400,
        'font-weight-medium':     500,
        'font-weight-semibold':   600,
        'font-weight-bold':       700,
        'line-height-tight':      1.25,
        'line-height-snug':       1.375,
        'line-height-normal':     1.5,
        'line-height-relaxed':    1.625,
        'letter-spacing-tight':   '-0.025em',
        'letter-spacing-normal':  '0em',
        'letter-spacing-wide':    '0.025em',

        // Component heights / density
        'height-control-xs':   '24px',
        'height-control-sm':   '28px',
        'height-control-md':   '36px',
        'height-control-lg':   '44px',
        'height-topbar':       '56px',
        'sidebar-expanded':    '220px',
        'sidebar-collapsed':   '52px',

        // Motion
        'duration-instant':    '50ms',
        'duration-fast':       '80ms',
        'duration-normal':     '150ms',
        'duration-slow':       '220ms',
        'duration-gentle':     '350ms',
        'ease-out-expo':       'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-out-quart':      'cubic-bezier(0.25, 1, 0.5, 1)',
        'ease-out-cubic':      'cubic-bezier(0.33, 1, 0.68, 1)',
        'ease-in-out':         'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-in':             'cubic-bezier(0.4, 0, 1, 1)',

        // Z-index
        'z-base':     0,
        'z-raised':   10,
        'z-dropdown': 100,
        'z-sticky':   150,
        'z-topbar':   200,
        'z-overlay':  300,
        'z-modal':    400,
        'z-toast':    500,
        'z-tooltip':  600,
    },
} as const

export type SemanticColorKey       = keyof typeof semanticTokens.light
export type SemanticSharedKey      = keyof typeof semanticTokens.shared

// ─── CSS custom-property references ──────────────────────────────────────────

/**
 * CSS custom-property reference strings.
 * Use in inline styles or CSS-in-JS, values respond to light/dark automatically.
 *
 * @example
 * // Inline style
 * <div style={{ color: vars.color.foreground }}>...</div>
 *
 * @example
 * // Emotion / styled-components
 * const Card = styled.div`
 *   background: ${vars.color.surface};
 *   border-radius: ${vars.radius.lg};
 *   box-shadow: ${vars.shadow.md};
 * `
 */
export const vars = {
    color: {
        background:          'var(--color-background)',
        surface:             'var(--color-surface)',
        surfaceRaised:       'var(--color-surface-raised)',
        border:              'var(--color-border)',
        borderStrong:        'var(--color-border-strong)',
        foreground:          'var(--color-foreground)',
        foregroundSecondary: 'var(--color-foreground-secondary)',
        foregroundMuted:     'var(--color-foreground-muted)',
        accent:              'var(--color-accent)',
        accentHover:         'var(--color-accent-hover)',
        accentForeground:    'var(--color-accent-foreground)',
        error:               'var(--color-error)',
        warning:             'var(--color-warning)',
        success:             'var(--color-success)',
        info:                'var(--color-info)',
        backdrop:            'var(--color-backdrop)',
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

    typography: {
        fontFamily:       'var(--font-family-sans)',
        fontSizeXs:       'var(--font-size-xs)',
        fontSizeSm:       'var(--font-size-sm)',
        fontSizeBase:     'var(--font-size-base)',
        fontSizeLg:       'var(--font-size-lg)',
        fontSizeXl:       'var(--font-size-xl)',
        fontSize2xl:      'var(--font-size-2xl)',
        fontSize3xl:      'var(--font-size-3xl)',
        fontWeightNormal:   'var(--font-weight-normal)',
        fontWeightMedium:   'var(--font-weight-medium)',
        fontWeightSemibold: 'var(--font-weight-semibold)',
        fontWeightBold:     'var(--font-weight-bold)',
        lineHeightTight:   'var(--line-height-tight)',
        lineHeightSnug:    'var(--line-height-snug)',
        lineHeightNormal:  'var(--line-height-normal)',
        lineHeightRelaxed: 'var(--line-height-relaxed)',
        letterSpacingTight:  'var(--letter-spacing-tight)',
        letterSpacingNormal: 'var(--letter-spacing-normal)',
        letterSpacingWide:   'var(--letter-spacing-wide)',
    },

    density: {
        controlXs:       'var(--height-control-xs)',
        controlSm:       'var(--height-control-sm)',
        controlMd:       'var(--height-control-md)',
        controlLg:       'var(--height-control-lg)',
        topbar:          'var(--height-topbar)',
        sidebarExpanded:  'var(--sidebar-expanded)',
        sidebarCollapsed: 'var(--sidebar-collapsed)',
    },

    motion: {
        durationInstant: 'var(--duration-instant)',
        durationFast:    'var(--duration-fast)',
        durationNormal:  'var(--duration-normal)',
        durationSlow:    'var(--duration-slow)',
        durationGentle:  'var(--duration-gentle)',
        easeOutExpo:     'var(--ease-out-expo)',
        easeOutQuart:    'var(--ease-out-quart)',
        easeOutCubic:    'var(--ease-out-cubic)',
        easeInOut:       'var(--ease-in-out)',
        easeIn:          'var(--ease-in)',
    },

    zIndex: {
        base:     'var(--z-base)',
        raised:   'var(--z-raised)',
        dropdown: 'var(--z-dropdown)',
        sticky:   'var(--z-sticky)',
        topbar:   'var(--z-topbar)',
        overlay:  'var(--z-overlay)',
        modal:    'var(--z-modal)',
        popover:  'var(--z-popover)',
        toast:    'var(--z-toast)',
        tooltip:  'var(--z-tooltip)',
    },
} as const

// ─── Convenience type exports ─────────────────────────────────────────────────
export type VarColorKey    = keyof typeof vars.color
export type VarRadiusKey   = keyof typeof vars.radius
export type VarShadowKey   = keyof typeof vars.shadow
export type VarTypoKey     = keyof typeof vars.typography
export type VarDensityKey  = keyof typeof vars.density
export type VarMotionKey   = keyof typeof vars.motion
export type VarZIndexKey   = keyof typeof vars.zIndex
