import type { Preview } from '@storybook/react'
import { initialize, mswLoader } from 'msw-storybook-addon'
import '../src/styles.css'

// Start MSW in Storybook (onUnhandledRequest: 'bypass' so non-mocked requests
// pass through instead of printing console errors for every icon/font request)
initialize({ onUnhandledRequest: 'bypass' })

const preview: Preview = {
    loaders: [mswLoader],
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        backgrounds: {
            default: 'light',
            values: [
                { name: 'light', value: '#DBF1FD' }, // --color-background
                { name: 'dark',  value: '#001233' }, // --color-background dark
            ],
        },
        // Default: no MSW handlers. Individual stories opt-in via parameters.msw
        msw: {
            handlers: [],
        },
    },
}

export default preview
