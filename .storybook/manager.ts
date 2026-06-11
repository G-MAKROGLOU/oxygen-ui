import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'
import { version } from '../package.json'

const theme = create({
    base: 'dark',

    // Brand — HTML title so the logo and the library version render together
    // (a plain `brandImage` would suppress the title text entirely).
    brandTitle: `
        <div style="display:flex;align-items:center;gap:8px">
            <img src="/oxygen-logo.svg" alt="Oxygen UI" style="height:32px" />
            <span style="font-size:10px;font-weight:600;color:#5c7a92;line-height:1;align-self:flex-end;padding-bottom:3px">v${version}</span>
        </div>
    `,
    brandUrl:   '#',
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
