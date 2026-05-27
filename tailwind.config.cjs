const PALETTE = require('./src/utils/palette.json')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{html,js,jsx,ts,tsx}',
        './.storybook/**/*.{js,ts,tsx}',
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
            // These map Tailwind classes to CSS custom properties so that
            // bg-background / text-foreground / border-border etc. respond to
            // light/dark mode automatically without a Tailwind rebuild.
            // Raw palette classes (bg-prussian-blue, etc.) continue to work.
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
            // Overrides Tailwind's sm/md/lg/xl/2xl with token-driven values.
            // All new components should use these via rounded-sm / rounded-lg etc.
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
            // Brand-tinted shadows for light mode; neutral-dark for dark mode.
            // CSS vars switch automatically; no dark: prefix needed.
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                xl: 'var(--shadow-xl)',
            },

            keyframes: {
                'accordion-down': {
                    from: { height: '0', opacity: '0' },
                    to: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
                    to: { height: '0', opacity: '0' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.22s cubic-bezier(0.25, 1, 0.5, 1)',
                'accordion-up': 'accordion-up 0.18s cubic-bezier(0.25, 1, 0.5, 1)',
            },
        },
    },
    plugins: [],
}
