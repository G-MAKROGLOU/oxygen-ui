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

OxygenUI ships a built-in MCP server and a set of Claude Code skills and commands that let AI assistants look up component APIs, search by use-case, generate complete page components, and bootstrap entire apps, all grounded in the real MDX documentation.

### Setup

The toolchain has two parts: the **MCP server** (does the work) and the **commands + skill** (how you call it from Claude Code). Both can be installed at user scope (available in every project on your machine) or project scope (committed to the repo, shared with the whole team).

#### Option A — User scope (recommended for individuals)

Installs everything into `~/.claude/`. Available in every Claude Code session from that point on.

```bash
# 1. Install commands + skill + MCP server config in one shot
npx --package=@geomak/ui@latest setup-claude

# If you already have @geomak/ui installed locally:
node node_modules/@geomak/ui/scripts/setup-claude.mjs
```

#### Option B — Project scope (recommended for teams)

Commits the toolchain into the repo so every developer who clones it gets it automatically.

```bash
# 1. Install commands + skill + .mcp.json into the project directory
npx --package=@geomak/ui@latest setup-claude --scope project

# If you already have @geomak/ui installed locally:
node node_modules/@geomak/ui/scripts/setup-claude.mjs --scope project

# 2. Commit the generated files so your team gets them on clone
git add .claude/ .mcp.json
git commit -m "chore: add OxygenUI Claude Code toolchain"
```

Both options write a `.mcp.json` / `~/.claude/mcp.json` entry pointing to `https://oxygenui.com/mcp` alongside the commands and skill, so no manual config is needed. Restart Claude Code (or reload the MCP server list) after running.

---

### MCP server

The server is deployed alongside Storybook at `https://oxygenui.com/mcp` (Netlify Function). It exposes eight tools in two tiers.

**Lookup tier** (docs + tokens):

| Tool | What it does |
|---|---|
| `list_components` | Browse all 100+ components with slug, category, and description |
| `get_component` | Full props API and usage examples for one component by slug |
| `find_component` | Keyword search across names, categories, and descriptions |
| `get_token` | Look up CSS custom properties by name or category prefix |

**Generation tier** (patterns + code):

| Tool | What it does |
|---|---|
| `get_pattern` | Full wired recipe for a page type: components, state, wiring steps, and a complete code example. Patterns: `crud-list`, `dashboard`, `settings-tabs`, `multi-step-form`, `detail-page`, `app-bootstrap` |
| `get_form_binding` | Correct `useForm` binder for any input (`fieldNative` / `fieldChecked` / `fieldTarget` / `field`), with paste-ready snippet |
| `compare_components` | Decision guide for similar components: Modal vs Drawer, Table vs DataGrid, Tabs vs SegmentedControl |
| `get_app_bootstrap` | Full Bootstrap.tsx + AppRoutes.tsx + brandTokens.ts template for a new project |

### Claude Code commands

Eight slash commands are available after setup:

**Lookup commands:**

| Command | Usage |
|---|---|
| `/ui-find <query>` | Search by use-case, e.g. `/ui-find virtualized table` |
| `/ui-lookup <name>` | Full docs for a component, e.g. `/ui-lookup wizard` |

**Generation commands** (write real files into your project):

| Command | Usage |
|---|---|
| `/ui-page <type> [entity]` | Scaffold a complete page file. Types: `crud`, `dashboard`, `settings`, `detail`, `multi-step-form`. Example: `/ui-page crud Vessel` |
| `/ui-bootstrap [name]` | Generate the four-file app bootstrap (Bootstrap.tsx, AppRoutes.tsx, brandTokens.ts, main.tsx) |
| `/ui-form <field:type ...>` | Generate a fully-wired Form from a field spec, e.g. `/ui-form name:text role:dropdown active:switch` |
| `/ui-table <entity> [col:type]` | Typed Table with column renderers + actions, e.g. `/ui-table Vessel name:string flag:string status:badge actions:menu` |
| `/ui-modal <type>` | Complete state + Modal JSX. Types: `confirm-delete`, `form-in-modal`, `detail-view`, `alert` |
| `/ui-auth-shell [name] [routes]` | Full SecureLayout + AppShell + Wizard tour shell, e.g. `/ui-auth-shell VesOPS dashboard,vessels,settings` |

Two additional library commands (`/ui-scaffold`, `/ui-story`) are available inside the `oxygen-ui` repository itself for contributors.

### Context skill

The `/oxygen-ui` skill (installed by the setup script) loads the full design system context into any Claude Code session: import patterns, form binder cheat sheet, component decision guide, provider nesting order, React Query integration, and page pattern reference. Invoke it at the start of any session where you plan to build against `@geomak/ui`.

### Local development with the MCP server

```bash
npm install -g netlify-cli          # one-time global install
yarn mcp:dev                        # generates manifest + starts netlify dev on port 8888
```

The function is then available at `http://localhost:8888/mcp`. Claude Code picks up the `oxygen-ui-local` entry from `.mcp.json` automatically when you open the project.

### How the manifest is built

At build time, `scripts/generate-ai-manifest.mjs` scans all MDX guide files in `src/docs/` and co-located MDX files in `src/components/`, strips Storybook boilerplate, and emits `netlify/_data/ai-manifest.js`. The Netlify Function bundles this via esbuild at deploy time. No database, no runtime file I/O, no cold-start penalty.

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
