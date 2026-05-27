# @oxygen/ui

Oxygen Design System — reusable UI primitives for React applications.

Built with **React 19**, **Radix UI** (accessibility & behaviour), and **Tailwind CSS v3**. Ships as ESM + CJS + TypeScript declarations.

---

## Installation

```bash
npm install @oxygen/ui
# or
yarn add @oxygen/ui
```

Import the stylesheet once at your app root:

```tsx
import '@oxygen/ui/styles'
```

Wrap your app with the required providers:

```tsx
import { TooltipProvider, NotificationProvider } from '@oxygen/ui'

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

---

## Components

### Inputs
`Button` · `TextInput` · `NumberInput` · `Password` · `SearchInput` · `Checkbox` · `Switch` · `Dropdown` · `AutoComplete` · `TreeSelect` · `FileInput` · `Temporal.DatePicker` · `Temporal.TemporalPicker` · `DropdownPill`

### Core
`Modal` · `Drawer` · `Tooltip` · `Tabs` · `Tree` · `ToggleButton` · `Table` · `List` · `MenuBar` · `ContextMenu` · `Wizard` · `Catalog` · `CatalogGrid` · `CatalogCarousel` · `GridCard` · `OpaqueGridCard` · `ScalableContainer` · `LoadingSpinner` · `FadingBase` · `Notification` · `ThemeSwitch` · `IconButton`

### Icons
`Icon.XClose` · `Icon.ChevronRight` · `Icon.Dashboard` · `Icon.FleetIcon` · … (50+ icons)

---

## Development

```bash
# Install dependencies
yarn

# Start Storybook
yarn storybook

# Build the library (ESM + CJS + .d.ts)
yarn build

# Type-check
yarn typecheck

# Lint
yarn lint
```

---

## Tailwind setup (consuming app)

The package ships a colour palette. Add to your `tailwind.config.js`:

```js
const PALETTE = require('@oxygen/ui/src/utils/palette.json')

module.exports = {
    content: [
        './src/**/*.{ts,tsx}',
        './node_modules/@oxygen/ui/dist/**/*.js',
    ],
    darkMode: 'class',
    theme: {
        colors: PALETTE,
        // ... your extensions
    },
}
```

---

## Releases

This package uses [semantic-release](https://github.com/semantic-release/semantic-release) with [Conventional Commits](https://www.conventionalcommits.org/).

| Commit prefix | Version bump |
|---|---|
| `fix:` | patch (0.0.x) |
| `feat:` | minor (0.x.0) |
| `feat!:` / `BREAKING CHANGE:` | major (x.0.0) |

Merging to `main` automatically lints, type-checks, publishes to npm, and deploys Storybook to Netlify.

---

## Publishing

Handled automatically by GitHub Actions on merge to `main`. To publish manually:

```bash
yarn build
npm publish --access public
```
