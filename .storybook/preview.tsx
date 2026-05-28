import React, { useEffect } from 'react'
import type { Preview, Decorator } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'
import '../src/styles/index.scss'

// Start MSW — explicit worker URL avoids path-resolution issues in Vite dev server
initialize({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
})

// ── Dark mode decorator ───────────────────────────────────────────────────────
// Reads the currently selected Storybook background and toggles .dark on <html>.

const DARK_BG = '#001233'

const withDarkMode: Decorator = (Story, context) => {
    // Storybook 10 globals: backgrounds.value is the option id ('light' | 'dark'),
    // not the hex string. The decorator paints its own dark surface so the chosen
    // background still reads correctly even when only the body class changes.
    const bg     = context.globals?.backgrounds?.value
    const isDark = bg === 'dark'

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark)
        return () => document.documentElement.classList.remove('dark')
    }, [isDark])

    return (
        <div style={{ minHeight: '100%', background: isDark ? DARK_BG : undefined }}>
            <Story />
        </div>
    )
}

const preview: Preview = {
    decorators: [withDarkMode],
    loaders:    [mswLoader],

    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },

        controls: {
            matchers: {
                color: /(background|color)$/i,
                date:  /Date$/i,
            },
        },

        // Two backgrounds map directly to light/dark token sets.
        // Selecting "dark" triggers the withDarkMode decorator above.
        backgrounds: {
            options: {
                light: { name: 'Light', value: '#eef4fa' },  // --color-background light
                dark:  { name: 'Dark',  value: DARK_BG   },  // --color-background dark
            },
        },

        msw: {
            handlers: [],
        },

        // ── Viewport presets ──────────────────────────────────────────────────
        // Matches the Tailwind breakpoints used in component responsive rules.
        // Switch via the toolbar phone/tablet icon in the Storybook canvas.
        viewport: {
            options: {
                mobile:  { name: 'Mobile  (375)',  styles: { width: '375px',  height: '812px'  } },
                mobileLg:{ name: 'Mobile  (430)',  styles: { width: '430px',  height: '932px'  } },
                tablet:  { name: 'Tablet  (768)',  styles: { width: '768px',  height: '1024px' } },
                desktop: { name: 'Desktop (1280)', styles: { width: '1280px', height: '900px'  } },
                wide:    { name: 'Wide    (1920)', styles: { width: '1920px', height: '1080px' } },
            }
        },

        // ── Sidebar order ─────────────────────────────────────────────────────
        // Design System docs always appear first. Component groups follow in the
        // intended product hierarchy. '*' catches any group not listed explicitly.
        options: {
            storySort: {
                order: [
                    'Design System',
                    [
                        'Introduction',
                        'Palette',
                        'Typography',
                        'Tokens',
                        'Parameterization',
                    ],
                    'Layout',
                    'Feedback',
                    'Data Display',
                    'Forms',
                    'Progress',
                    'Reporting',
                    'E-Commerce',
                    'Sci-Fi',
                    'Hooks',
                    // Legacy groups — will be reorganized into the sections above
                    'Core',
                    'Inputs',
                    '*',
                ],
            },
        },
    },

    initialGlobals: {
        viewport: {
            value: 'desktop',
            isRotated: false
        },

        backgrounds: {
            value: 'light'
        }
    }
}

export default preview
