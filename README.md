<div align="center">

<img src="./public/oxygen-logo.svg" alt="oxygen-ui" width="96" height="96" />

# @geomak/ui · Oxygen Design System

**100+ production-grade React components for enterprise apps**, dashboards, CRMs, internal tools, and landing pages. Token-driven, accessible, light/dark first-class, and properly tree-shakeable.

[![npm version](https://img.shields.io/npm/v/@geomak/ui?color=0466c8&label=npm)](https://www.npmjs.com/package/@geomak/ui)
[![types](https://img.shields.io/npm/types/@geomak/ui?color=0466c8)](https://www.npmjs.com/package/@geomak/ui)
[![license](https://img.shields.io/npm/l/@geomak/ui?color=0466c8)](./LICENSE)
[![React 19](https://img.shields.io/badge/React-19-0466c8)](https://react.dev)
[![Storybook](https://img.shields.io/badge/Storybook-live%20demo-ff4785)](https://oxygenui.com)

### ▶ [Browse the live, interactive demo →](https://oxygenui.com)

<!-- Tip: drop a Storybook screen-recording here for the launch, docs/assets/preview.gif -->

</div>

Built on **React 19**, **Radix UI** (accessibility + behaviour), **Tailwind CSS**, and **Framer Motion**. Ships as ESM + CJS + TypeScript declarations, with a CSS-variable token layer you can re-theme at runtime.

---

## Why oxygen-ui

- **Token-driven, dark mode first-class.** Every colour, radius, shadow, and motion value is a CSS variable. Light and dark aren't an afterthought, both are designed. Re-theme the whole system with one override.
- **Accessible by default.** Behaviour comes from Radix (focus traps, keyboard nav, ARIA); icons are `aria-hidden`, controls are labelled.
- **Genuinely tree-shakeable.** Import one icon and ship **0.45 KB** (not the whole set). The entire library is **~76 KB gzipped** with deps external, and a CI guard keeps it from regressing.
- **Strict and tested.** `strict` TypeScript, ESLint at zero warnings, 360+ unit tests, per-export bundle budgets in CI.
- **Batteries included.** Not just buttons, a `Scheduler`, a real-time `Chat` (WebSocket-ready), `Table` with pagination, a `Form` engine, an e-commerce `Cart`, and a full **Marketing** kit (hero, pricing, testimonials, lead capture) to build the landing page too.

---

## Quick start

```bash
npm install @geomak/ui      # peer deps: react@19, react-dom@19
```

```tsx
import '@geomak/ui/styles'                       // 1. tokens + component styles, once at the root
import { ThemeProvider, Button, Badge } from '@geomak/ui'

export default function App() {
  return (
    <ThemeProvider>                              {/* 2. light/dark + token theming */}
      <Button content="Get started" />
      <Badge tone="accent">New</Badge>
    </ThemeProvider>
  )
}
```

Tree-shakeable icons live on their own subpath:

```tsx
import { ChevronDown, Search, createIcon } from '@geomak/ui/icons'
```

> Optional providers wrap only the features you use: `NotificationProvider`, `TooltipProvider`, `CartProvider`.

---

## Components

100+ components across these groups, all with **live controls and a written guide** in [Storybook](https://oxygenui.com).

| Group | Components |
|---|---|
| **Layout** | AppShell · Box · Flex · Grid · Portal · ScalableContainer |
| **Navigation** | TopBar · Sidebar · Breadcrumbs · ContextMenu · MegaMenu · MenuButton |
| **Buttons** | Button · IconButton · FAB |
| **Inputs** | TextInput · NumberInput · Password · SearchInput · TextArea · Checkbox · Switch · RadioGroup · SegmentedControl · Dropdown · AutoComplete · TreeSelect · TagsInput · Slider · Rating · OtpInput · FileInput · ColorPicker · DatePicker · DateRangePicker · TimePicker |
| **Forms** | Form (`useForm`) · CreditCardForm |
| **Data Display** | Table · List · Tree · Tabs · Accordion · Card · CardCarousel · Statistic · Avatar · Badge · Kbd · Typography · **Chat** · **Scheduler** · Timeline · Stepper |
| **Feedback** | Modal · Drawer · Tooltip · Notification · PopConfirm · Wizard · LogoutTimer |
| **Progress** | LoadingSpinner · Skeleton |
| **E-Commerce** | Cart · CartProvider / `useCart` · CartButton · EmptyCart · Checkout |
| **Marketing** | Jumbotron · FeatureGrid · PricingPlans · Testimonials · SlideShow · Video · Parallax · Blog · Socials · CookieConsent · LeadCapture |
| **Icons** | `Icon.*` namespace · `@geomak/ui/icons` (tree-shakeable) · `createIcon` |
| **Theming** | ThemeProvider · ThemeSwitch |
| **Hooks** | useForm · useJwt · useBreakpoint · useLocalStorage |

---

## Design tokens

Every visual decision is a CSS variable (colour, radius, shadow, typography, density, motion, z-index). Tokens are also exported as JS for canvas / email / SSR:

```tsx
import { vars, semanticTokens, palette } from '@geomak/ui/tokens'

<div style={{ background: vars.color.surface, borderRadius: vars.radius.lg }} />   // CSS-var refs (auto light/dark)
semanticTokens.dark.accent // resolved hex
```

Override globally, after importing the stylesheet:

```css
:root { --color-accent: #7c3aed; }
```

See the **Tokens**, **Palette**, and **Parameterization** guides in Storybook.

---

## Tailwind setup (optional)

The shipped `@geomak/ui/styles` already covers the components. This step is only needed if you want the same brand palette + token utilities in *your own* markup:

```js
// tailwind.config.cjs
const { palette } = require('@geomak/ui/tokens')

module.exports = {
  content: ['./src/**/*.{ts,tsx}', './node_modules/@geomak/ui/dist/**/*.js'],
  darkMode: 'class',
  theme: { extend: { colors: palette } },
}
```

The standard **gray / slate / zinc** ramps and **black** stay available alongside the brand palette.

---

## Package exports

| Import | What |
|---|---|
| `@geomak/ui` | All components, providers, hooks, the `Icon` namespace, `cx` |
| `@geomak/ui/icons` | Tree-shakeable named icons + `createIcon` |
| `@geomak/ui/styles` | Compiled CSS (tokens + components) |
| `@geomak/ui/tokens` | `palette`, `semanticTokens`, `vars` as JS |

---

## AI toolchain (Claude Code)

OxygenUI ships a built-in MCP server and a set of Claude Code skills and commands that let AI assistants look up component APIs, search by use-case, and scaffold new components, all grounded in the real MDX documentation.

### MCP server

The server is deployed alongside Storybook on Netlify as a Netlify Function at `/mcp`. It exposes four tools:

| Tool | What it does |
|---|---|
| `list_components` | Browse all 100+ components with slug, category, and description |
| `get_component` | Fetch the full props API and usage examples for one component by slug |
| `find_component` | Keyword search across names, categories, and descriptions |
| `get_token` | Look up CSS custom properties by name or category prefix |

**Connect it:**

```jsonc
// .mcp.json (already in the repo, update the URL after first deploy)
{
  "mcpServers": {
    "oxygen-ui": {
      "type": "http",
      "url": "https://your-site.netlify.app/mcp"
    },
    "oxygen-ui-local": {
      "type": "http",
      "url": "http://localhost:8888/mcp"
    }
  }
}
```

Or add it from the CLI: `claude mcp add oxygen-ui --transport http https://your-site.netlify.app/mcp`

### Claude Code commands

Four slash commands are registered in `.claude/commands/`:

| Command | Usage |
|---|---|
| `/ui-lookup <name>` | Fetch the full docs for a component, e.g. `/ui-lookup wizard` |
| `/ui-find <query>` | Search by use-case, e.g. `/ui-find virtualized table` |
| `/ui-scaffold <name>` | Scaffold a new component with source + story + MDX guide |
| `/ui-story <name>` | Add story coverage for an existing component |

### Context skill

The `/oxygen-ui` skill loads the full design system context into any Claude Code session, import patterns, token usage, Tailwind utilities, form API, and repository conventions. Invoke it at the start of any session where you plan to build against `@geomak/ui`.

### Local development with the MCP server

```bash
npm install -g netlify-cli          # one-time global install
yarn mcp:dev                        # generates manifest + starts netlify dev on port 8888
```

The function is then available at `http://localhost:8888/mcp`. Claude Code picks up the `oxygen-ui-local` entry from `.mcp.json` automatically when you open the project.

### How the manifest is built

At build time, `scripts/generate-ai-manifest.mjs` scans all 101 MDX guide files in `src/docs/` and the co-located MDX files in `src/components/`, strips Storybook boilerplate, and emits `netlify/functions/ai-manifest.json`. The Netlify Function bundles this JSON via esbuild, no database, no runtime file I/O, no cold-start penalty.

---

## Development

```bash
yarn              # install
yarn storybook    # interactive catalog + guides
yarn build        # ESM + CJS + .d.ts + styles
yarn ci           # typecheck + lint + test + bundle-size guard
yarn size         # report per-export gzip sizes against budgets
```

Releases are automated with [semantic-release](https://github.com/semantic-release/semantic-release) + [Conventional Commits](https://www.conventionalcommits.org/): merging to `main` lints, type-checks, tests, publishes to npm, and deploys Storybook.

---

## License

[MIT](./LICENSE) © G-MAKROGLOU
