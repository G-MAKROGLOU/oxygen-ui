import remarkGfm from 'remark-gfm'
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx|js|jsx)', '../src/**/*.mdx'],
    addons: ['@storybook/addon-links', 'msw-storybook-addon', '@storybook/addon-docs'],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    // Infer rich Controls + prop descriptions from our TypeScript interfaces.
    // `propFilter` keeps each component's own props and drops the inherited
    // DOM/React attributes (from node_modules), so Controls stay focused.
    typescript: {
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            shouldExtractLiteralValuesFromEnum: true,
            shouldRemoveUndefinedFromOptional: true,
            propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
        },
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
