import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'
import { version } from '../package.json'

const theme = create({
    base: 'dark',

    // Brand — HTML title so the logo and the library version render together
    // (a plain `brandImage` would suppress the title text entirely). The
    // build-time package.json version is only a fallback: the badge updates
    // itself from the npm registry at runtime (see below), because the
    // release bot's version-bump commit is tagged [skip ci] — builds always
    // run one commit BEFORE the bump, so a baked-in version lags forever.
    brandTitle: `
        <div style="display:flex;align-items:center;gap:8px">
            <img src="/oxygen-logo.svg" alt="Oxygen UI" style="height:32px" />
            <span id="oxygen-version-badge" style="font-size:10px;font-weight:600;color:#5c7a92;line-height:1;align-self:flex-end;padding-bottom:3px">v${version}</span>
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

// Keep the version badge live: ask the npm registry for the latest published
// version and overwrite the build-time fallback once the sidebar renders.
const updateVersionBadge = async () => {
    try {
        const res = await fetch('https://registry.npmjs.org/@geomak%2Fui/latest')
        if (!res.ok) return
        const { version: latest } = (await res.json()) as { version?: string }
        if (!latest) return
        for (let i = 0; i < 40; i++) {
            const el = document.getElementById('oxygen-version-badge')
            if (el) {
                el.textContent = `v${latest}`
                return
            }
            await new Promise((r) => setTimeout(r, 250))
        }
    } catch {
        /* offline / registry hiccup — the build-time fallback stays */
    }
}
void updateVersionBadge()
