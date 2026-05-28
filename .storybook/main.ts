import remarkGfm from 'remark-gfm'
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx|js|jsx)', '../src/**/*.mdx'],
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
    staticDirs: ['../public'],
    docs: {
        autodocs: 'tag',
        // Enable GFM so markdown tables render correctly in MDX docs
        mdxPluginOptions: {
            mdxCompileOptions: {
                remarkPlugins: [remarkGfm],
            },
        },
    },
}

export default config
