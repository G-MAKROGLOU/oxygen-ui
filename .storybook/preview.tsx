import React, { useEffect } from 'react'
import type { Preview, Decorator } from '@storybook/react'
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
    const bg     = context.globals?.backgrounds?.value
    const isDark = bg === DARK_BG

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
            default: 'light',
            values: [
                { name: 'light', value: '#eef4fa' },  // --color-background light
                { name: 'dark',  value: DARK_BG    },  // --color-background dark
            ],
        },

        msw: {
            handlers: [],
        },
    },
}

export default preview
