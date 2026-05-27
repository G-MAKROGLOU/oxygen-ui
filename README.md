# @vesops/ui

VesOPS Design System — reusable UI primitives for maritime SaaS applications.

Built with **React 19**, **Radix UI** (accessibility & behaviour), and **Tailwind CSS v3** (VesOPS palette). Ships as ESM + CJS + TypeScript declarations.

---

## Installation

```bash
npm install @vesops/ui
# or
yarn add @vesops/ui
```

Import the stylesheet once at your app root:

```tsx
import '@vesops/ui/styles'
```

Wrap your app with the required providers:

```tsx
import { TooltipProvider, NotificationProvider } from '@vesops/ui'

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
```

---

## Tailwind setup (consuming app)

The package requires the VesOPS Tailwind theme. Add to your `tailwind.config.js`:

```js
const PALETTE = require('@vesops/ui/src/utils/palette.json')

module.exports = {
    content: [
        './src/**/*.{ts,tsx}',
        './node_modules/@vesops/ui/dist/**/*.js',
    ],
    darkMode: 'class',
    theme: {
        colors: PALETTE,
        // ... your extensions
    },
}
```

---

## Publishing

```bash
yarn build
npm publish --access public
```
