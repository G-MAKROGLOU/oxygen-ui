import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        'msw-storybook-addon',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    // Serve the MSW service worker from public/
    staticDirs: ['../public'],
    docs: {
        autodocs: 'tag',
    },
}

export default config
