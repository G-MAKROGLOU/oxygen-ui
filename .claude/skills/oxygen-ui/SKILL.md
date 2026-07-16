---
name: oxygen-ui
description: >
  Context skill for working with the OxygenUI (@geomak/ui) design system.
  Equips Claude Code with knowledge about available components, tokens, import
  patterns, and how to use the MCP server for real-time docs lookup.
---

# OxygenUI Design System

You are working inside the `@geomak/ui` repository — a React component library
built with Radix UI primitives, Tailwind CSS utilities, and a three-layer token
system. Everything ships as tree-shakeable ESM.

---

## MCP server

An `oxygen-ui` MCP server is configured in `.mcp.json`. Use its tools whenever
you need to look up component APIs, prop tables, or design tokens.

| Tool | When to call |
|---|---|
| `find_component` | Before writing any UI — check what the design system already has |
| `get_component` | Get full props + examples for a specific component (use the slug) |
| `list_components` | Browse all 100+ entries when unsure what exists |
| `get_token` | Look up CSS custom properties by name or category prefix |

**Always call `find_component` first.** OxygenUI ships ~100 components spanning
inputs, data display, layout, e-commerce, marketing, and hooks. Writing something
from scratch without checking first is almost always redundant.

---

## Import pattern

```tsx
// Named imports from the main entry — tree-shakeable
import { Button, Modal, DataGrid, useExcel } from '@geomak/ui'

// Styles — include once at app root
import '@geomak/ui/styles'

// Token values for JS/TS code
import { vars, semanticTokens, palette } from '@geomak/ui/tokens'

// Icons
import { Icon } from '@geomak/ui'
<Icon.Search size={20} />
```

---

## Token system

Three layers:

| Layer | Use case |
|---|---|
| `palette` | Raw brand hex values |
| `semanticTokens` | Resolved hex/px values in `{ light, dark, shared }` objects |
| `vars` | CSS custom-property strings: `vars.color.accent`, `vars.radius.md` |

### CSS custom properties (use in inline styles or SCSS)

```tsx
<div style={{
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-foreground)',
}}>
```

### Tailwind utilities

The library exposes semantic Tailwind classes; use them in JSX `className`:

| Utility | Token |
|---|---|
| `bg-surface` | `--color-surface` |
| `bg-surface-raised` | `--color-surface-raised` |
| `border-border` | `--color-border` |
| `text-foreground` | `--color-foreground` |
| `text-foreground-muted` | `--color-foreground-muted` |
| `bg-accent` | `--color-accent` |
| `text-accent-fg` | `--color-accent-foreground` |

---

## Key component patterns

### ThemeProvider (required at app root)

```tsx
import { ThemeProvider } from '@geomak/ui'

<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

### Forms — built-in `useForm`

```tsx
import { useForm, Form, FormField, TextInput, Button } from '@geomak/ui'

const form = useForm({ defaultValues: { email: '' } })

<Form form={form} onSubmit={values => console.log(values)}>
  <FormField name="email" rules={[isRequired()]}>
    <TextInput placeholder="Email" />
  </FormField>
  <Button type="submit">Submit</Button>
</Form>
```

### Modal

```tsx
import { Modal } from '@geomak/ui'

<Modal open={open} onOpenChange={setOpen} title="Confirm">
  <Modal.Body>Are you sure?</Modal.Body>
  <Modal.Footer>
    <Button onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="primary" onClick={confirm}>Confirm</Button>
  </Modal.Footer>
</Modal>
```

---

## Storybook

Stories live in `src/**/*.stories.tsx` (CSF3 format). The Storybook dev server
is in `.claude/launch.json` as `"storybook"` (port 6006).

Guide MDX files live in `src/docs/` (one per component).

---

## Repository conventions

- Component source: `src/components/{core,inputs,forms,layout,marketing}/`
- Hooks: `src/hooks/`
- Story title format: `"Category/ComponentName"` or `"Category/ComponentName/Guide"`
- All MDX guides use HTML tables (not GFM) with exported `th/td/td0/tbl` style constants
- Commit convention: `fix:` (patch) · `feat:` (minor) · `docs:` (no bump) — semantic-release runs in CI
- Never bump `version` in `package.json` manually
