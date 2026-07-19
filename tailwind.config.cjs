const PALETTE = require('./src/utils/palette.json')
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{html,js,jsx,ts,tsx}',
        './.storybook/**/*.{js,ts,tsx,jsx}',
    ],
    darkMode: 'class',
    theme: {
        screens: {
            sm:  '480px',
            md:  '768px',
            lg:  '976px',
            xl:  '1440px',
        },
        // Brand palette + standard neutral scales. PALETTE holds the brand
        // tokens; the gray/slate/zinc ramps and black are merged back in as
        // sane defaults (Tailwind's `theme.colors` replaces the built-ins, so
        // without this they'd be unavailable, see the earlier off-palette bugs).
        colors: {
            ...PALETTE,
            black: colors.black,
            gray:  colors.gray,
            slate: colors.slate,
            zinc:  colors.zinc,
        },
        fontFamily: {
            sans: ['var(--font-family-sans)', 'sans-serif'],
        },
        extend: {
            spacing: {
                128: '32rem',
                144: '36rem',
            },

            // ── Semantic color utilities ─────────────────────────────────────
            // bg-background, text-foreground, border-border, etc.
            colors: {
                background:             'var(--color-background)',
                surface:                'var(--color-surface)',
                'surface-raised':       'var(--color-surface-raised)',
                border:                 'var(--color-border)',
                'border-strong':        'var(--color-border-strong)',
                foreground:             'var(--color-foreground)',
                'foreground-secondary': 'var(--color-foreground-secondary)',
                'foreground-muted':     'var(--color-foreground-muted)',
                accent:                 'var(--color-accent)',
                'accent-hover':         'var(--color-accent-hover)',
                'accent-fg':            'var(--color-accent-foreground)',
                'status-error':         'var(--color-error)',
                'status-warning':       'var(--color-warning)',
                'status-success':       'var(--color-success)',
                'status-info':          'var(--color-info)',
                // Scrim behind modals / drawers. Alpha is baked into the token
                // value, so use the bare `bg-backdrop` utility (no `/opacity`
                // modifier, that produces invalid CSS on a var-valued token).
                'backdrop':             'var(--color-backdrop)',
                // Soft focus-halo colours, `color-mix` reads the accent / error
                // var live, so theme overrides flow through. Used as the ring
                // colour for the refined input focus state (crisp 1px border +
                // low-opacity 3px halo). Avoids the `/opacity` modifier, which
                // produces invalid CSS on hex-valued CSS-var tokens.
                'focus-ring':           'color-mix(in oklab, var(--color-accent) 22%, transparent)',
                'focus-ring-error':     'color-mix(in oklab, var(--color-error) 22%, transparent)',
            },

            // ── Radius utilities, rounded-sm, rounded-md, etc. ──────────────
            borderRadius: {
                sm:    'var(--radius-sm)',
                md:    'var(--radius-md)',
                lg:    'var(--radius-lg)',
                xl:    'var(--radius-xl)',
                '2xl': 'var(--radius-2xl)',
                full:  'var(--radius-full)',
            },

            // ── Shadow utilities, shadow-sm, shadow-md, etc. ────────────────
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                xl: 'var(--shadow-xl)',
            },

            // ── Typography, font-size-*, font-weight-* etc. ─────────────────
            fontSize: {
                xs:    ['var(--font-size-xs)',   { lineHeight: 'var(--line-height-normal)' }],
                sm:    ['var(--font-size-sm)',   { lineHeight: 'var(--line-height-normal)' }],
                base:  ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
                lg:    ['var(--font-size-lg)',   { lineHeight: 'var(--line-height-snug)'   }],
                xl:    ['var(--font-size-xl)',   { lineHeight: 'var(--line-height-snug)'   }],
                '2xl': ['var(--font-size-2xl)',  { lineHeight: 'var(--line-height-tight)'  }],
                '3xl': ['var(--font-size-3xl)',  { lineHeight: 'var(--line-height-tight)'  }],
            },
            fontWeight: {
                normal:   'var(--font-weight-normal)',
                medium:   'var(--font-weight-medium)',
                semibold: 'var(--font-weight-semibold)',
                bold:     'var(--font-weight-bold)',
            },
            lineHeight: {
                tight:   'var(--line-height-tight)',
                snug:    'var(--line-height-snug)',
                normal:  'var(--line-height-normal)',
                relaxed: 'var(--line-height-relaxed)',
            },
            letterSpacing: {
                tight:  'var(--letter-spacing-tight)',
                normal: 'var(--letter-spacing-normal)',
                wide:   'var(--letter-spacing-wide)',
                wider:  'var(--letter-spacing-wider)',
            },

            // ── Component heights, h-control-md, h-topbar, etc. ────────────
            height: {
                'control-xs': 'var(--height-control-xs)',
                'control-sm': 'var(--height-control-sm)',
                'control-md': 'var(--height-control-md)',
                'control-lg': 'var(--height-control-lg)',
                'topbar':     'var(--height-topbar)',
            },

            // ── Motion, duration-fast, ease-out-expo, etc. ──────────────────
            transitionDuration: {
                instant: 'var(--duration-instant)',
                fast:    'var(--duration-fast)',
                normal:  'var(--duration-normal)',
                slow:    'var(--duration-slow)',
                gentle:  'var(--duration-gentle)',
            },
            transitionTimingFunction: {
                'out-expo':  'var(--ease-out-expo)',
                'out-quart': 'var(--ease-out-quart)',
                'out-cubic': 'var(--ease-out-cubic)',
                'in-out':    'var(--ease-in-out)',
                'in':        'var(--ease-in)',
            },

            // ── Z-index, z-dropdown, z-modal, etc. ──────────────────────────
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

            // ── Animation utilities, animate-accordion-down, etc. ───────────
            // Keyframes are defined in src/styles/_animations.scss.
            // Only animation shorthand utilities are configured here.
            animation: {
                'accordion-down':    'accordion-down 0.22s var(--ease-out-quart)',
                'accordion-up':      'accordion-up   0.18s var(--ease-out-quart)',
                'tooltip-in-bottom': 'tooltip-in-bottom 0.13s var(--ease-out-expo)',
                'tooltip-in-top':    'tooltip-in-top    0.13s var(--ease-out-expo)',
                'tooltip-in-right':  'tooltip-in-right  0.13s var(--ease-out-expo)',
                'tooltip-in-left':   'tooltip-in-left   0.13s var(--ease-out-expo)',
                'tooltip-out':       'tooltip-out 0.08s var(--ease-in)',
                'check-pop':         'check-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'shimmer':           'shimmer 1.6s ease-in-out infinite',
                'fade-in':           'fade-in var(--duration-normal) var(--ease-out-cubic)',
                'scale-in':          'scale-in var(--duration-normal) var(--ease-out-expo)',
                'slide-in-top':      'slide-in-from-top    var(--duration-normal) var(--ease-out-expo)',
                'slide-in-bottom':   'slide-in-from-bottom var(--duration-normal) var(--ease-out-expo)',
                'slide-in-left':     'slide-in-from-left   var(--duration-normal) var(--ease-out-expo)',
                'slide-in-right':    'slide-in-from-right  var(--duration-normal) var(--ease-out-expo)',
                'breathe':           'breathe 2s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
