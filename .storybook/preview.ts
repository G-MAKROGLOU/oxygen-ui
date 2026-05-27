import type { Preview } from '@storybook/react'
import '../src/styles.css'

const preview: Preview = {
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
                { name: 'light', value: '#f1f5fb' },  // ice
                { name: 'dark',  value: '#0d2137' },  // oxford-blue
            ],
        },
    },
}

export default preview
