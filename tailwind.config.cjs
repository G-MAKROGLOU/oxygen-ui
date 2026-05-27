const PALETTE = require('./src/utils/palette.json')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{html,js,jsx,ts,tsx}',
        './.storybook/**/*.{js,ts,tsx,jsx}',
    ],
    darkMode: 'class',
    theme: {
        screens: {
            sm: '480px',
            md: '768px',
            lg: '976px',
            xl: '1440px',
        },
        colors: PALETTE,
        fontFamily: {
            sans: ['Inter var', 'sans-serif'],
        },
        extend: {
            spacing: {
                128: '32rem',
                144: '36rem',
            },

            // ── Semantic color utilities ─────────────────────────────────────
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
            },

            // ── Semantic radius utilities ────────────────────────────────────
            borderRadius: {
                '4xl':  '2rem',
                sm:     'var(--radius-sm)',
                md:     'var(--radius-md)',
                lg:     'var(--radius-lg)',
                xl:     'var(--radius-xl)',
                '2xl':  'var(--radius-2xl)',
                full:   'var(--radius-full)',
            },

            // ── Semantic shadow utilities ────────────────────────────────────
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                xl: 'var(--shadow-xl)',
            },

            keyframes: {
                // ── Accordion ────────────────────────────────────────────────
                'accordion-down': {
                    from: { height: '0', opacity: '0' },
                    to:   { height: 'var(--radix-accordion-content-height)', opacity: '1' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
                    to:   { height: '0', opacity: '0' },
                },

                // ── Tooltip ──────────────────────────────────────────────────
                // direction-aware: the tooltip nudges toward the trigger
                'tooltip-in-bottom': {
                    from: { opacity: '0', transform: 'translateY(-4px) scale(0.97)' },
                    to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                'tooltip-in-top': {
                    from: { opacity: '0', transform: 'translateY(4px) scale(0.97)' },
                    to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                'tooltip-in-right': {
                    from: { opacity: '0', transform: 'translateX(-4px) scale(0.97)' },
                    to:   { opacity: '1', transform: 'translateX(0) scale(1)' },
                },
                'tooltip-in-left': {
                    from: { opacity: '0', transform: 'translateX(4px) scale(0.97)' },
                    to:   { opacity: '1', transform: 'translateX(0) scale(1)' },
                },
                'tooltip-out': {
                    from: { opacity: '1' },
                    to:   { opacity: '0' },
                },

                // ── Checkbox ─────────────────────────────────────────────────
                'check-pop': {
                    '0%':   { opacity: '0', transform: 'scale(0) rotate(-12deg)' },
                    '60%':  { opacity: '1', transform: 'scale(1.2) rotate(4deg)' },
                    '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
                },

                // ── Skeleton shimmer ─────────────────────────────────────────
                'shimmer': {
                    '0%':   { backgroundPosition: '-400% 0' },
                    '100%': { backgroundPosition: '400% 0' },
                },
            },

            animation: {
                'accordion-down':   'accordion-down 0.22s cubic-bezier(0.25, 1, 0.5, 1)',
                'accordion-up':     'accordion-up 0.18s cubic-bezier(0.25, 1, 0.5, 1)',
                'tooltip-in-bottom':'tooltip-in-bottom 0.13s cubic-bezier(0.16, 1, 0.3, 1)',
                'tooltip-in-top':   'tooltip-in-top 0.13s cubic-bezier(0.16, 1, 0.3, 1)',
                'tooltip-in-right': 'tooltip-in-right 0.13s cubic-bezier(0.16, 1, 0.3, 1)',
                'tooltip-in-left':  'tooltip-in-left 0.13s cubic-bezier(0.16, 1, 0.3, 1)',
                'tooltip-out':      'tooltip-out 0.08s ease-in',
                'check-pop':        'check-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'shimmer':          'shimmer 1.6s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
