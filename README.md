# @geomak/ui

**Oxygen Design System** — a production-grade React component library for enterprise apps: internal dashboards, CRM tools, and landing pages.

Built with **React 19**, **Radix UI** (accessibility & behaviour), **Tailwind CSS v3**, and **Framer Motion**. Fully themeable through a CSS-variable design-token layer, with first-class light/dark support. Ships as ESM + CJS + TypeScript declarations.

---

## Installation

```bash
npm install @geomak/ui
# or
yarn add @geomak/ui
```

Import the stylesheet once at your app root:

```tsx
import '@geomak/ui/styles'
```

Wrap your app with the providers for the features you use:

```tsx
import { NotificationProvider, TooltipProvider } from '@geomak/ui'

function App() {
    return (
        <NotificationProvider>
            <TooltipProvider>
                {/* your app */}
            </TooltipProvider>
        </NotificationProvider>
    )
}
```

Optional providers: `ThemeProvider` (scoped theming / dark mode), `CartProvider` (e-commerce cart state).

---

## Components

60+ components across the following groups. Browse the full, interactive catalog with live controls and guides in **Storybook** (`yarn storybook`, or the deployed build on Netlify).

| Group | Components |
|---|---|
| **Layout** | AppShell · Box · Flex · Grid · Portal · ScalableContainer · FadingBase |
| **Navigation** | TopBar · Sidebar · Breadcrumbs · ContextMenu · MegaMenu |
| **Buttons** | Button · IconButton · FAB |
| **Inputs** | TextInput · NumberInput · Password · SearchInput · TextArea · Checkbox · Switch · RadioGroup · SegmentedControl · Dropdown · AutoComplete · TreeSelect · TagsInput · Slider · Rating · OtpInput · FileInput · ColorPicker · DatePicker · DateRangePicker · TimePicker |
| **Forms** | Form (`useForm` API) · CreditCardForm |
| **Data Display** | Table · List · Tree · Tabs · Accordion · Card · CardCarousel · Statistic · Avatar · Badge · Kbd · Calendar · Typography |
| **Feedback** | Modal · Drawer · Tooltip · Notification · PopConfirm · Wizard |
| **Progress** | LoadingSpinner · Skeleton |
| **E-Commerce** | Cart · CartProvider / `useCart` · CartButton · EmptyCart · Checkout |
| **Theming** | ThemeProvider · ThemeSwitch |

---

## Design tokens

Every visual decision is driven by a CSS-variable token layer (colours, radius, shadows, typography, density, motion, z-index) — swap any of it at runtime with a single override. Tokens are also exported as JS for canvas / email / SSR contexts:

```tsx
import { semanticTokens, vars, palette } from '@geomak/ui/tokens'

// CSS-var references (respond to light/dark automatically)
<div style={{ background: vars.color.surface, borderRadius: vars.radius.lg }} />

// Resolved hex/px values
semanticTokens.dark.accent // '#2d88ff'
```

Override globally after importing the stylesheet:

```css
:root { --color-accent: #7c3aed; }
```

See the **Tokens**, **Palette**, and **Parameterization** guides in Storybook.

---

## Tailwind setup (consuming app)

To use the same tokens and utilities in your own markup, extend your Tailwind config with the shipped brand palette. The library's compiled `styles` already cover the components themselves — this step is only needed for your own classes.

```js
const PALETTE = require('@geomak/ui/src/utils/palette.json')

module.exports = {
    content: ['./src/**/*.{ts,tsx}', './node_modules/@geomak/ui/dist/**/*.js'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: PALETTE,
            // semantic utilities map to the CSS vars, e.g.:
            // background: 'var(--color-background)', surface: 'var(--color-surface)', …
        },
    },
}
```

The library's own config also restores the standard **gray / slate / zinc** ramps and **black** alongside the brand palette, so the basic neutrals are always available.

---

## Development

```bash
yarn              # install dependencies
yarn storybook    # start Storybook
yarn build        # build the library (ESM + CJS + .d.ts + styles)
yarn typecheck    # type-check
yarn lint         # lint
yarn test         # run unit tests (Vitest)
yarn ci           # typecheck + lint + test
```

---

## Releases

Uses [semantic-release](https://github.com/semantic-release/semantic-release) with [Conventional Commits](https://www.conventionalcommits.org/).

| Commit prefix | Version bump |
|---|---|
| `fix:` | patch (0.0.x) |
| `feat:` | minor (0.x.0) |
| `feat!:` / `BREAKING CHANGE:` | major (x.0.0) |

Merging to `main` automatically lints, type-checks, tests, publishes to npm, and deploys Storybook to Netlify.

---

## Publishing

Handled automatically by GitHub Actions on merge to `main`. To publish manually:

```bash
yarn build
npm publish --access public
```
