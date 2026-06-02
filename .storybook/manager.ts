import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

const theme = create({
    base: 'dark',

    // Brand
    brandTitle: 'Oxygen UI',
    brandUrl:   '#',
    brandImage: '/oxygen-logo.svg',
    brandTarget: '_self',

    // Accent
    colorPrimary:   '#0466C8',
    colorSecondary: '#2d88ff',

    // App chrome
    appBg:          '#060f1a',
    appContentBg:   '#0d1f30',
    appPreviewBg:   '#060f1a',
    appBorderColor: '#1e3348',
    appBorderRadius: 5,

    // Typography
    fontBase: '"Inter var", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontCode: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',

    // Text
    textColor:       '#e8f0f8',
    textInvertColor: '#0a1929',
    textMutedColor:  '#9ab0c4',

    // Toolbar / sidebar
    barTextColor:     '#9ab0c4',
    barHoverColor:    '#e8f0f8',
    barSelectedColor: '#2d88ff',
    barBg:            '#0d1f30',

    // Inputs
    inputBg:           '#152638',
    inputBorder:       '#1e3348',
    inputTextColor:    '#e8f0f8',
    inputBorderRadius: 5,
})

addons.setConfig({ theme })
