---
name: oxygen-ui
description: >
  Context skill for working with the OxygenUI (@geomak/ui) design system.
  Equips Claude Code with knowledge about available components, tokens, import
  patterns, and how to use the MCP server for real-time docs lookup.
---

# OxygenUI Design System

You are working inside the `@geomak/ui` repository, a React component library
built with Radix UI primitives, Tailwind CSS utilities, and a three-layer token
system. Everything ships as tree-shakeable ESM.

---

## MCP server

An `oxygen-ui` MCP server is configured in `.mcp.json`. Use its tools whenever
you need to look up component APIs, prop tables, or design tokens.

| Tool | When to call |
|---|---|
| `find_component` | Before writing any UI, check what the design system already has |
| `get_component` | Get full props + examples for a specific component (use the slug) |
| `list_components` | Browse all 100+ entries when unsure what exists |
| `get_token` | Look up CSS custom properties by name or category prefix |
| `get_pattern` | Get a full wired recipe for a page-level pattern (crud-list, dashboard, etc.) |
| `get_form_binding` | Look up the correct `useForm` binder for any input component |
| `compare_components` | Get a decision guide when choosing between similar components |
| `get_app_bootstrap` | Get the full provider stack + app shell bootstrap code |

**Always call `find_component` first.** OxygenUI ships 100+ components. Writing
from scratch without checking is almost always redundant.

---

## Import pattern

```tsx
// Named imports from the main entry (tree-shakeable)
import { Button, Modal, DataGrid, useExcel } from '@geomak/ui'

// Styles: include once at app root
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

## Form binder cheat sheet

**This is the most common source of silent bugs.** Every `useForm` field must use
the correct binder for its input type or values will not update.

| Input component | Binder method | Value type stored |
|---|---|---|
| `TextInput`, `TextArea`, `Password`, `SearchInput` | `fieldNative` | `string` |
| `NumberInput` | `fieldNative` | `number` |
| `Switch`, `Checkbox` | `fieldChecked` | `boolean` |
| `Dropdown`, `TreeSelect`, `AutoComplete` | `fieldTarget` | `key` or `key[]` |
| `RadioGroup` | `field` | option value |
| `Slider` | `field` | `number` or `[number, number]` |
| `DatePicker`, `TimePicker` | `field` | `Date \| null` |
| `DateRangePicker` | `field` | `{ from: Date; to: Date } \| null` |
| `TagsInput` | `field` | `string[]` |
| `ColorPicker` | `field` | `string` (hex) |
| `Rating` | `field` | `number` |

```tsx
// Example: mixed form with correct binders
const form = useForm({ defaultValues: { name: '', role: '', active: false, joined: null } })

<Form form={form} onFinish={handleSubmit}>
  <FormField name="name"><TextInput label="Name" {...form.fieldNative('name')} /></FormField>
  <FormField name="role"><Dropdown label="Role" items={roles} {...form.fieldTarget('role')} /></FormField>
  <FormField name="active"><Switch label="Active" {...form.fieldChecked('active')} /></FormField>
  <FormField name="joined"><DatePicker label="Joined" {...form.field('joined')} /></FormField>
</Form>
```

Call `get_form_binding` MCP tool when unsure which binder to use for a specific input.

---

## Component decision guide

### Modal vs Drawer vs PopConfirm

| Component | Use when |
|---|---|
| `Modal` | The action needs full attention; no background context helps (confirm, form submit) |
| `Drawer` | User benefits from seeing the page behind (filter panel, row inspector, quick edit) |
| `PopConfirm` | Inline destructive confirmation on a specific row/button; no overlay needed |

Both Modal and Drawer share the same controlled API: `open` + `onClose` + `hasFooter` + `onOk` + `onCancel`.

### Table vs DataGrid vs VirtualList vs List

| Component | Use when |
|---|---|
| `Table` | Standard paginated, sortable, searchable data; editable cells optional |
| `DataGrid` | Excel-like: column reorder/resize, bulk edits, copy-paste cell behaviour |
| `VirtualList` | 10k+ rows where DOM count is the bottleneck; no built-in sort/filter |
| List (custom) | Single-column items, icon + label, no comparison between columns |

### Tabs vs SegmentedControl

| Component | Use when |
|---|---|
| `Tabs` | Three or more sibling content panes; content is substantial |
| `SegmentedControl` | Two to four compact mutually exclusive filter-style options |

---

## App bootstrap (provider nesting order)

This order is required. Getting it wrong causes token overrides, notification
portals, or dark mode to break silently.

```tsx
// main.tsx or Bootstrap.tsx
import { ThemeProvider, NotificationProvider } from '@geomak/ui'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

const queryClient = new QueryClient()

export function Bootstrap() {
  return (
    <ThemeProvider colorScheme={colorScheme}>        {/* always outermost */}
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>                     {/* must be inside ThemeProvider */}
            <AppRoutes />
          </NotificationProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
```

Dark mode toggle: maintain `colorScheme` state in Bootstrap, pass it to `ThemeProvider`,
and also toggle `document.documentElement.classList.toggle('dark', isDark)` so that
Tailwind dark utilities work inside portals that render outside the ThemeProvider div.

Custom brand tokens (optional):

```tsx
const BRAND_TOKENS = {
  '--color-accent': '#1A56DB',
  '--color-accent-hover': '#1e429f',
}

<ThemeProvider colorScheme={colorScheme} theme={BRAND_TOKENS} darkTheme={BRAND_TOKENS}>
```

---

## useNotification

Must be used inside a component that is a descendant of `NotificationProvider`.

```tsx
import { useNotification } from '@geomak/ui'

function MyPage() {
  const notification = useNotification()

  const onSave = async () => {
    try {
      await api.save(data)
      notification.success({ title: 'Saved', description: 'Changes applied.', duration: 3000 })
    } catch (err) {
      notification.error({ title: 'Save failed', description: err.message, duration: 5000 })
    }
  }
}
```

Methods: `notification.success`, `notification.info`, `notification.warning`, `notification.error`.
All accept `{ title, description?, duration? }`.

---

## React Query integration

Map React Query state to OxygenUI component props:

```tsx
const { data, isPending, isFetching, isError, refetch } = useQuery({ queryKey, queryFn })

// First load: full skeleton
if (isPending) return <SkeletonBox className="h-96 w-full" />

// Error state
if (isError) return <ErrorState onRetry={refetch} />

// Background refetch: show spinner overlay on existing content (not a full skeleton)
// isPending=false, isFetching=true means data is already on screen
return (
  <Table
    data={data}
    loading={isFetching && !isPending}  // subtle refetch indicator
    columns={columns}
  />
)
```

For mutations:

```tsx
const mutation = useMutation({
  mutationFn: api.create,
  onSuccess: () => {
    notification.success({ title: 'Created' })
    queryClient.invalidateQueries({ queryKey })
  },
  onError: (err) => notification.error({ title: 'Failed', description: err.message }),
})

<Button loading={mutation.isPending} onClick={() => mutation.mutate(formData)}>
  Save
</Button>
```

---

## SecureLayout + route guard pattern

```tsx
// AppRoutes.tsx
import { AppShell, SecureLayout } from '@geomak/ui'
import { Routes, Route, Navigate } from 'react-router-dom'

function AppRoutes() {
  return (
    <AppShell topBar={<TopBar />} sidebarSections={sidebarSections}>
      <Routes>
        {/* Auth-gated routes: wrap parent Route with SecureLayout */}
        <Route
          element={
            <SecureLayout
              isAuthenticated={isAuthenticated}
              fallback={<Navigate to="/login" replace />}
              loadingFallback={null}
            />
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  )
}
```

---

## Wizard + AppShell onboarding tour

Wizard must WRAP AppShell (not be inside it) so it can overlay the full viewport.
Refs for Wizard steps go on wrapper `<span>` elements inside the `icon` prop of each
`SidebarItem`, because `SidebarItem` has no `ref` prop.

```tsx
const dashboardRef = useRef<HTMLSpanElement>(null)
const settingsRef  = useRef<HTMLSpanElement>(null)

const sidebarSections = [{
  items: [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <span ref={dashboardRef}><Icon.Home size={18} /></span>,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <span ref={settingsRef}><Icon.Settings size={18} /></span>,
    },
  ],
}]

const wizardSteps = [
  { target: dashboardRef, title: 'Dashboard', description: 'Your overview at a glance.' },
  { target: settingsRef,  title: 'Settings',  description: 'Configure your preferences.' },
]

<Wizard steps={wizardSteps} storageKey="my-app-tour">
  <AppShell topBar={...} sidebarSections={sidebarSections}>
    <Routes>...</Routes>
  </AppShell>
</Wizard>
```

---

## Page patterns reference

| Pattern | Key components |
|---|---|
| **CRUD list** | Table + Modal (create/edit) + Form + useForm + PopConfirm + useNotification |
| **Dashboard overview** | Statistic cards + Skeleton + Dropdown (filter) + optional chart cards |
| **Settings / admin tabs** | Tabs + Form per panel + Switch/Dropdown + useNotification on save |
| **Multi-step wizard form** | Stepper + Form (per step or sectioned) + validation before advancing |
| **Detail / inspection page** | Tabs + Statistic + Timeline + Drawer (row inspector) + Badge |
| **Authenticated app shell** | ThemeProvider + NotificationProvider + AppShell + SecureLayout + Wizard tour |

Use `get_pattern` MCP tool for the full wired recipe (components + state + wiring steps + code example) for any of these.

---

## Key component patterns

### ThemeProvider (required at app root)

```tsx
import { ThemeProvider } from '@geomak/ui'

<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>
```

### Modal

```tsx
import { Modal } from '@geomak/ui'

const [open, setOpen] = useState(false)

<Modal open={open} onClose={() => setOpen(false)} title="Confirm" onOk={handleOk}>
  <p>Are you sure?</p>
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
- Commit convention: `fix:` (patch), `feat:` (minor), `docs:` (no bump); semantic-release runs in CI
- Never bump `version` in `package.json` manually
