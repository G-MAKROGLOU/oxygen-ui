// OxygenUI MCP server, stateless Netlify Function (Streamable HTTP, POST /mcp)
// Implements the Model Context Protocol JSON-RPC 2.0 subset required for tool-based docs lookup.
// Manifest is generated at build time by: node scripts/generate-ai-manifest.mjs
//
// Registered tools:
//   list_components  , index of all components with slug, category, description
//   get_component    , full MDX docs for a single component by slug
//   find_component   , keyword search across names, categories, descriptions
//   get_token        , lookup CSS custom properties by name or prefix

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore, generated JS module, no type declarations
import MANIFEST from '../_data/ai-manifest.js'

// ─── Types ────────────────────────────────────────────────────────────────────

type ManifestComponent = (typeof MANIFEST)['components'][number]

interface JsonRpcRequest {
  jsonrpc: '2.0'
  id?: string | number | null
  method: string
  params?: Record<string, unknown>
}

interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: string | number | null
  result?: unknown
  error?: { code: number; message: string }
}

type TextContent = { type: 'text'; text: string }

// ─── Tool registry ────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'list_components',
    description:
      'List every component, hook, and utility in the OxygenUI (@geomak/ui) design system. ' +
      'Returns each entry\'s slug (for use with get_component), display name, category, and description.',
    inputSchema: { type: 'object', properties: {}, required: [] as string[] },
  },
  {
    name: 'get_component',
    description:
      'Fetch the full documentation for a specific OxygenUI component, hook, or utility, ' +
      'including its props API, usage examples, and recipes. Pass the slug from list_components or find_component.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Component slug, e.g. "accordion", "data-grid", "use-excel", "table", "wizard".',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'find_component',
    description:
      'Search OxygenUI for a component by name, functionality, or keyword. ' +
      'Use this before writing any UI code to discover what the design system already provides.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Free-text query, e.g. "date picker", "virtualized table", "pdf viewer", "form validation".',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_token',
    description:
      'Look up OxygenUI design tokens, CSS custom properties for color, radius, shadow, motion, ' +
      'typography, z-index, and density. Returns matching variable names grouped by category.',
    inputSchema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Token name or category prefix to search, e.g. "--color-accent", "radius", "motion", "shadow", "color".',
        },
      },
      required: ['token'],
    },
  },
  {
    name: 'get_pattern',
    description:
      'Get a full wired recipe for a common page-level UI pattern, which components to use, ' +
      'what state to declare, how they wire together, and a complete runnable code example. ' +
      'Patterns: crud-list, dashboard, settings-tabs, multi-step-form, detail-page, app-bootstrap.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Pattern name: "crud-list", "dashboard", "settings-tabs", "multi-step-form", "detail-page", "app-bootstrap".',
        },
        entity: {
          type: 'string',
          description: 'Optional entity/domain name (e.g. "Vessel", "Order", "User") to personalise variable names in the example.',
        },
      },
      required: ['pattern'],
    },
  },
  {
    name: 'get_form_binding',
    description:
      'Given an OxygenUI input component name, returns the correct useForm binder method, ' +
      'the value type stored, and a paste-ready code snippet. ' +
      'Use this before adding any input to a Form to avoid silent binding bugs.',
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: 'Input component name, e.g. "Dropdown", "Switch", "DatePicker", "TagsInput", "Slider".',
        },
      },
      required: ['input'],
    },
  },
  {
    name: 'compare_components',
    description:
      'Returns a structured "when to use which" decision guide for two or more similar OxygenUI components. ' +
      'Useful for choosing between Modal/Drawer/PopConfirm, Table/DataGrid/VirtualList, Tabs/SegmentedControl, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        components: {
          type: 'array',
          items: { type: 'string' },
          description: 'Two or more component slugs to compare, e.g. ["modal", "drawer"], ["table", "data-grid", "virtual-list"].',
        },
      },
      required: ['components'],
    },
  },
  {
    name: 'get_app_bootstrap',
    description:
      'Returns the recommended full app bootstrap code for a new project using @geomak/ui: ' +
      'provider nesting order, ThemeProvider with dark-mode toggle, NotificationProvider, ' +
      'optional React Query and React Router wiring, and SecureLayout route guard pattern.',
    inputSchema: {
      type: 'object',
      properties: {
        router: { type: 'boolean', description: 'Include React Router + SecureLayout shell.' },
        reactQuery: { type: 'boolean', description: 'Include QueryClientProvider.' },
        customTheme: { type: 'boolean', description: 'Include brand token override pattern.' },
        appName: { type: 'string', description: 'App name used for variable naming in output.' },
      },
      required: [],
    },
  },
] as const

// ─── Tool handlers ────────────────────────────────────────────────────────────

function listComponents(): TextContent[] {
  const lines = MANIFEST.components.map(
    c => `- **${c.name}** · \`${c.slug}\` · _${c.category}_, ${c.description}`,
  )
  return [{ type: 'text', text: `# OxygenUI Components (${lines.length})\n\n${lines.join('\n')}` }]
}

function getComponent(slug: string): TextContent[] {
  const lower = slug.toLowerCase()
  const hit = MANIFEST.components.find(
    c => c.slug === lower || c.name.toLowerCase() === lower,
  )

  if (!hit) {
    const suggestions = MANIFEST.components
      .filter(c => c.slug.includes(lower) || c.name.toLowerCase().includes(lower))
      .slice(0, 5)
      .map(c => `\`${c.slug}\``)

    const hint = suggestions.length
      ? `\n\nClose matches: ${suggestions.join(', ')}`
      : '\n\nUse `list_components` to browse all available entries.'

    return [{ type: 'text', text: `Component not found: "${slug}"${hint}` }]
  }

  return [{ type: 'text', text: hit.content }]
}

function findComponent(query: string): TextContent[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)

  const scored = MANIFEST.components
    .map(c => {
      const haystack = `${c.name} ${c.category} ${c.description} ${c.slug}`.toLowerCase()
      const score = words.reduce((n, w) => n + (haystack.includes(w) ? 1 : 0), 0)
      return { c, score }
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  if (!scored.length) {
    return [{
      type: 'text',
      text: `No components matched "${query}".\n\nTry different terms, or call \`list_components\` to browse everything.`,
    }]
  }

  const lines = scored.map(
    ({ c }) => `- **${c.name}** · \`${c.slug}\` · _${c.category}_, ${c.description}`,
  )
  return [{ type: 'text', text: `# Results for "${query}"\n\n${lines.join('\n')}` }]
}

function getToken(token: string): TextContent[] {
  const q = token.toLowerCase().replace(/^--/, '')
  const matches = (MANIFEST.tokens.all as string[]).filter(v => v.replace('--', '').includes(q))

  if (!matches.length) {
    return [{
      type: 'text',
      text:
        `No tokens matched "${token}".\n\n` +
        `Available categories: color, radius, shadow, motion, font, leading, tracking, z, density, height.\n` +
        `Example queries: "--color-accent", "radius", "motion", "shadow".`,
    }]
  }

  // Group by first segment after --
  const grouped = new Map<string, string[]>()
  for (const v of matches) {
    const cat = v.split('-').slice(0, 2).join('-') // e.g. "--color"
    const arr = grouped.get(cat) ?? []
    arr.push(v)
    grouped.set(cat, arr)
  }

  const sections = [...grouped.entries()]
    .map(([cat, vars]) => `### ${cat}\n${vars.map(v => `- \`${v}\``).join('\n')}`)
    .join('\n\n')

  return [{ type: 'text', text: `# Tokens matching "${token}" (${matches.length})\n\n${sections}` }]
}

// ─── Static data for new tools ────────────────────────────────────────────────

const FORM_BINDINGS: Record<string, { binder: string; valueType: string; snippet: string; note?: string }> = {
  textinput:       { binder: 'fieldNative',   valueType: 'string',                    snippet: '<TextInput label="Name" {...form.fieldNative(\'name\')} />' },
  textarea:        { binder: 'fieldNative',   valueType: 'string',                    snippet: '<TextArea label="Notes" {...form.fieldNative(\'notes\')} />' },
  password:        { binder: 'fieldNative',   valueType: 'string',                    snippet: '<Password label="Password" {...form.fieldNative(\'password\')} />' },
  searchinput:     { binder: 'fieldNative',   valueType: 'string',                    snippet: '<SearchInput {...form.fieldNative(\'query\')} />' },
  numberinput:     { binder: 'fieldNative',   valueType: 'number',                    snippet: '<NumberInput label="Amount" {...form.fieldNative(\'amount\')} />' },
  switch:          { binder: 'fieldChecked',  valueType: 'boolean',                   snippet: '<Switch label="Active" {...form.fieldChecked(\'active\')} />' },
  checkbox:        { binder: 'fieldChecked',  valueType: 'boolean',                   snippet: '<Checkbox label="Agree" {...form.fieldChecked(\'agree\')} />' },
  dropdown:        { binder: 'fieldTarget',   valueType: 'key | key[]',               snippet: '<Dropdown label="Role" items={options} {...form.fieldTarget(\'role\')} />', note: 'Returns key[] when isMultiselect=true.' },
  treeselect:      { binder: 'fieldTarget',   valueType: 'key | key[]',               snippet: '<TreeSelect label="Category" nodes={tree} {...form.fieldTarget(\'category\')} />' },
  autocomplete:    { binder: 'fieldTarget',   valueType: 'key',                       snippet: '<AutoComplete label="User" items={users} {...form.fieldTarget(\'userId\')} />' },
  radiogroup:      { binder: 'field',         valueType: 'option value',              snippet: '<RadioGroup options={opts} {...form.field(\'choice\')} />' },
  slider:          { binder: 'field',         valueType: 'number | [number, number]', snippet: '<Slider min={0} max={100} {...form.field(\'range\')} />' },
  datepicker:      { binder: 'field',         valueType: 'Date | null',               snippet: '<DatePicker label="Date" {...form.field(\'date\')} />' },
  timepicker:      { binder: 'field',         valueType: 'Date | null',               snippet: '<TimePicker label="Time" {...form.field(\'time\')} />' },
  temporalpicker:  { binder: 'field',         valueType: 'Date | null',               snippet: '<TemporalPicker label="DateTime" {...form.field(\'datetime\')} />' },
  daterangepicker: { binder: 'field',         valueType: '{ from: Date; to: Date } | null', snippet: '<DateRangePicker label="Period" {...form.field(\'period\')} />' },
  tagsinput:       { binder: 'field',         valueType: 'string[]',                  snippet: '<TagsInput label="Tags" {...form.field(\'tags\')} />' },
  colorpicker:     { binder: 'field',         valueType: 'string (hex)',              snippet: '<ColorPicker {...form.field(\'color\')} />' },
  rating:          { binder: 'field',         valueType: 'number',                    snippet: '<Rating {...form.field(\'rating\')} />' },
}

const PATTERNS: Record<string, (entity: string) => string> = {
  'crud-list': (E) => {
    const e = E.toLowerCase()
    return `# Pattern: CRUD List Page (${E})

## Components needed
- Table<${E}> (columns, search, pagination, custom actions column)
- Modal (create / edit form overlay)
- Form + useForm (field binding per input type)
- PopConfirm (row-level delete)
- useNotification (success/error toasts)
- Button (toolbar "New ${E}" trigger)

## State to declare
\`\`\`tsx
const [items, setItems] = useState<${E}[]>([])
const [open, setOpen]     = useState(false)
const [selected, setSelected] = useState<${E} | null>(null)  // null = create mode
\`\`\`

## Wiring steps
1. Define TableColumn<${E}>[] including a custom "actions" column
2. In the actions column renderer: Edit button sets selected + opens modal; Delete button uses PopConfirm
3. Modal: open={open}, onClose resets selected to null and closes
4. Form: call form.reset(selected ?? defaultValues) in a useEffect when open changes
5. onFinish: call API, then notification.success(), reset form, setOpen(false), refetch

## Full example
\`\`\`tsx
import { useState, useEffect } from 'react'
import {
  Table, TableColumn, Modal, Form, FormField, useForm,
  TextInput, Dropdown, PopConfirm, Button, useNotification,
} from '@geomak/ui'

interface ${E} {
  id: number
  name: string
  status: string
}

const DEFAULT: Omit<${E}, 'id'> = { name: '', status: 'active' }
const STATUS_OPTIONS = [
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
]

export function ${E}sPage() {
  const notification = useNotification()
  const form = useForm({ defaultValues: DEFAULT })

  const [items, setItems]     = useState<${E}[]>([])
  const [open, setOpen]       = useState(false)
  const [selected, setSelected] = useState<${E} | null>(null)

  const openCreate = () => { setSelected(null); setOpen(true) }
  const openEdit   = (row: ${E}) => { setSelected(row); setOpen(true) }
  const closeModal = () => { setSelected(null); setOpen(false) }

  useEffect(() => {
    form.reset(selected ?? DEFAULT)
  }, [open])

  const onFinish = async (values: Omit<${E}, 'id'>) => {
    try {
      if (selected) {
        await api.update(selected.id, values)
        setItems(prev => prev.map(i => i.id === selected.id ? { ...i, ...values } : i))
      } else {
        const created = await api.create(values)
        setItems(prev => [...prev, created])
      }
      notification.success({ title: selected ? '${E} updated' : '${E} created' })
      closeModal()
    } catch (err: unknown) {
      notification.error({ title: 'Save failed', description: String(err) })
    }
  }

  const onDelete = async (row: ${E}) => {
    try {
      await api.delete(row.id)
      setItems(prev => prev.filter(i => i.id !== row.id))
      notification.success({ title: '${E} deleted' })
    } catch (err: unknown) {
      notification.error({ title: 'Delete failed', description: String(err) })
    }
  }

  const columns: TableColumn<${E}>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: '',
      component: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>Edit</Button>
          <PopConfirm title="Delete this ${e}?" onConfirm={() => onDelete(row)}>
            <Button size="sm" variant="ghost">Delete</Button>
          </PopConfirm>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">${E}s</h1>
        <Button variant="primary" onClick={openCreate}>New ${E}</Button>
      </div>

      <Table data={items} columns={columns} hasSearch pagination getRowKey={r => r.id} />

      <Modal
        open={open}
        onClose={closeModal}
        title={selected ? \`Edit \${selected.name}\` : 'New ${E}'}
        onOk={form.submit}
        okText={selected ? 'Save' : 'Create'}
      >
        <Form form={form} onFinish={onFinish}>
          <FormField name="name" rules={[{ required: true }]}>
            <TextInput label="Name" {...form.fieldNative('name')} />
          </FormField>
          <FormField name="status">
            <Dropdown label="Status" items={STATUS_OPTIONS} {...form.fieldTarget('status')} />
          </FormField>
        </Form>
      </Modal>
    </div>
  )
}
\`\`\``
  },

  'dashboard': (E) => `# Pattern: Dashboard Overview Page${E ? ` (${E})` : ''}

## Components needed
- Statistic (KPI cards in a grid)
- SkeletonBox / SkeletonText (first-load placeholders)
- Dropdown or DateRangePicker (period filter in the toolbar)
- Card (chart wrapper with expand/collapse)
- useNotification (query error feedback)
- Badge (status indicators)

## State to declare
\`\`\`tsx
const [period, setPeriod] = useState('this_month')
\`\`\`

## React Query integration
\`\`\`tsx
const { data, isPending, isFetching, isError, refetch } = useQuery({
  queryKey: ['dashboard', period],
  queryFn: () => api.getDashboard(period),
})
\`\`\`

## Wiring steps
1. isPending (first load): render SkeletonBox placeholders in each card slot
2. isError: show an error state with a retry button that calls refetch()
3. isFetching && !isPending: show subtle loading overlay on existing content (not full skeleton)
4. Pass statistics to Statistic components; charts receive their data arrays

## Full example
\`\`\`tsx
import { Statistic, SkeletonBox, Dropdown, Card, useNotification } from '@geomak/ui'
import { useQuery } from '@tanstack/react-query'

const PERIOD_OPTIONS = [
  { key: 'today',       label: 'Today' },
  { key: 'this_week',   label: 'This week' },
  { key: 'this_month',  label: 'This month' },
]

export function DashboardPage() {
  const [period, setPeriod] = useState('this_month')
  const notification = useNotification()

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => api.getDashboard(period),
    onError: (err) => notification.error({ title: 'Load failed', description: String(err) }),
  })

  if (isPending) {
    return (
      <div className="grid grid-cols-4 gap-4 p-6">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonBox key={i} className="h-28" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Dropdown
          items={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
          label="Period"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Statistic label="Total" value={data?.total ?? 0} />
        <Statistic label="Active" value={data?.active ?? 0} delta={{ value: 12, direction: 'up' }} />
        <Statistic label="Pending" value={data?.pending ?? 0} />
        <Statistic label="Completed" value={data?.completed ?? 0} />
      </div>
    </div>
  )
}
\`\`\``,

  'settings-tabs': (E) => `# Pattern: Settings / Admin Tabs Page${E ? ` (${E})` : ''}

## Components needed
- Tabs (controlled, variant="underline")
- Form + useForm per panel (or one form, reset on tab change)
- TextInput, Switch, Dropdown with correct binders
- Button variant="primary" for save
- useNotification for save feedback

## State to declare
\`\`\`tsx
const [tab, setTab] = useState('general')
\`\`\`

## Wiring steps
1. Tabs controlled: value={tab} onChange={setTab}
2. Each Tabs.Panel contains its own Form + useForm
3. Load server data into form.reset() inside useEffect with server data as dependency
4. onFinish: call API, notification.success on success, notification.error on failure
5. Keep "Save" Button outside the Form but trigger form.submit() on click

## Full example
\`\`\`tsx
import { Tabs, Form, FormField, useForm, TextInput, Switch, Button, useNotification } from '@geomak/ui'

export function SettingsPage() {
  const notification = useNotification()
  const generalForm = useForm({ defaultValues: { displayName: '', email: '' } })
  const prefForm    = useForm({ defaultValues: { notifications: true, darkMode: false } })

  const saveGeneral = async (values: { displayName: string; email: string }) => {
    try {
      await api.updateProfile(values)
      notification.success({ title: 'Profile saved' })
    } catch (err: unknown) {
      notification.error({ title: 'Save failed', description: String(err) })
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Settings</h1>
      <Tabs variant="underline">
        <Tabs.List>
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="preferences">Preferences</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Panel value="general">
          <Form form={generalForm} onFinish={saveGeneral} className="flex flex-col gap-4 mt-4">
            <FormField name="displayName" rules={[{ required: true }]}>
              <TextInput label="Display name" {...generalForm.fieldNative('displayName')} />
            </FormField>
            <FormField name="email" rules={[{ required: true }]}>
              <TextInput label="Email" type="email" {...generalForm.fieldNative('email')} />
            </FormField>
            <Button variant="primary" onClick={generalForm.submit}>Save changes</Button>
          </Form>
        </Tabs.Panel>

        <Tabs.Panel value="preferences">
          <div className="flex flex-col gap-4 mt-4">
            <Switch label="Email notifications" {...prefForm.fieldChecked('notifications')} />
            <Switch label="Dark mode" {...prefForm.fieldChecked('darkMode')} />
            <Button variant="primary" onClick={prefForm.submit}>Save preferences</Button>
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
\`\`\``,

  'multi-step-form': (E) => `# Pattern: Multi-Step Wizard Form${E ? ` (${E})` : ''}

## Components needed
- Stepper (controlled current + status per step)
- Form + useForm (one form across all steps, or per-step)
- Field inputs appropriate per step
- Button for Next / Back / Submit
- useNotification for async errors

## State to declare
\`\`\`tsx
const [step, setStep]     = useState(0)
const [status, setStatus] = useState<'active' | 'loading'>('active')
\`\`\`

## Wiring steps
1. Stepper: current={step}; steps array with label + optional description
2. On "Next": validate current step fields, setStatus('loading'), save step data to API, setStatus('active'), advance step
3. On "Back": just setStep(s => s - 1), no validation needed
4. On "Submit" (last step): full form submit + notification

## Full example
\`\`\`tsx
import { Stepper, Form, FormField, useForm, TextInput, Dropdown, Button, useNotification } from '@geomak/ui'

const STEPS = [
  { label: 'Basic info' },
  { label: 'Details' },
  { label: 'Review' },
]

export function ${E || 'Multi'}StepForm() {
  const notification = useNotification()
  const form = useForm({
    defaultValues: { name: '', email: '', role: '', department: '' },
  })

  const [step, setStep]     = useState(0)
  const [status, setStatus] = useState<'active' | 'loading'>('active')

  const next = async () => {
    const errors = await form.validateAll()
    if (Object.keys(errors).length) return
    setStatus('loading')
    try {
      await api.saveStep(step, form.getValues())
      setStep(s => s + 1)
    } catch (err: unknown) {
      notification.error({ title: 'Step failed', description: String(err) })
    } finally {
      setStatus('active')
    }
  }

  const submit = async (values: Record<string, unknown>) => {
    try {
      await api.submit(values)
      notification.success({ title: 'Submitted successfully' })
    } catch (err: unknown) {
      notification.error({ title: 'Submit failed', description: String(err) })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl">
      <Stepper steps={STEPS} current={step} status={status} />

      <Form form={form} onFinish={submit}>
        {step === 0 && (
          <>
            <FormField name="name" rules={[{ required: true }]}>
              <TextInput label="Full name" {...form.fieldNative('name')} />
            </FormField>
            <FormField name="email" rules={[{ required: true }]}>
              <TextInput label="Email" type="email" {...form.fieldNative('email')} />
            </FormField>
          </>
        )}
        {step === 1 && (
          <>
            <FormField name="role">
              <Dropdown label="Role" items={roleOptions} {...form.fieldTarget('role')} />
            </FormField>
            <FormField name="department">
              <Dropdown label="Department" items={deptOptions} {...form.fieldTarget('department')} />
            </FormField>
          </>
        )}
        {step === 2 && (
          <div className="text-foreground">Review your details before submitting.</div>
        )}
      </Form>

      <div className="flex gap-2 justify-end">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>
        )}
        {step < STEPS.length - 1
          ? <Button variant="primary" onClick={next}>Next</Button>
          : <Button variant="primary" onClick={form.submit}>Submit</Button>
        }
      </div>
    </div>
  )
}
\`\`\``,

  'detail-page': (E) => `# Pattern: Detail / Inspection Page${E ? ` (${E})` : ''}

## Components needed
- Tabs (Overview / Activity / Documents, etc.)
- Statistic (key metrics in the header)
- Badge (status chip in the header)
- Breadcrumbs (navigation context)
- Timeline (activity history in the Activity tab)
- Table (documents / history in sub-tabs)
- Drawer placement="right" (row inspector, keeps table visible behind)

## State to declare
\`\`\`tsx
const [drawerItem, setDrawerItem] = useState<SubItem | null>(null)
\`\`\`

## Wiring step: Drawer
Keep open={drawerItem !== null} and onClose={() => setDrawerItem(null)}.
The table's row click calls setDrawerItem(row).

## Full example skeleton
\`\`\`tsx
import { Tabs, Statistic, Badge, Breadcrumbs, Timeline, Table, Drawer } from '@geomak/ui'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export function ${E || 'Entity'}DetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isPending } = useQuery({ queryKey: ['${(E || 'entity').toLowerCase()}', id], queryFn: () => api.get(id!) })
  const [drawerItem, setDrawerItem] = useState<SubItem | null>(null)

  if (isPending) return <div className="p-6"><SkeletonBox className="h-40 mb-4" /><SkeletonBox className="h-96" /></div>

  return (
    <div className="flex flex-col gap-6 p-6">
      <Breadcrumbs items={[{ label: '${E || 'Items'}', href: '/${(E || 'items').toLowerCase()}s' }, { label: data.name }]} />

      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <Badge tone={data.status === 'active' ? 'success' : 'neutral'}>{data.status}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Statistic label="Created" value={data.createdAt} />
        <Statistic label="Updated" value={data.updatedAt} />
        <Statistic label="Items" value={data.itemCount} />
      </div>

      <Tabs variant="underline">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
          <Tabs.Trigger value="documents">Documents</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <p className="text-foreground-muted mt-4">{data.description}</p>
        </Tabs.Panel>

        <Tabs.Panel value="activity">
          <Timeline events={data.timeline} className="mt-4" />
        </Tabs.Panel>

        <Tabs.Panel value="documents">
          <Table
            data={data.documents}
            columns={docColumns}
            onRowClick={setDrawerItem}
            className="mt-4"
          />
        </Tabs.Panel>
      </Tabs>

      <Drawer
        open={drawerItem !== null}
        onClose={() => setDrawerItem(null)}
        title={drawerItem?.name ?? ''}
        placement="right"
      >
        {drawerItem && <pre className="text-sm">{JSON.stringify(drawerItem, null, 2)}</pre>}
      </Drawer>
    </div>
  )
}
\`\`\``,

  'app-bootstrap': (_E) => `# Pattern: App Bootstrap (full provider stack)

## Files to create
- src/main.tsx (entry point)
- src/Bootstrap.tsx (provider stack)
- src/approutes/AppRoutes.tsx (shell + routing)
- src/utils/brandTokens.ts (optional theme overrides)

## Provider nesting order (required)

ThemeProvider must be outermost. NotificationProvider must be inside ThemeProvider
so its toast portal inherits the theme tokens. BrowserRouter wraps everything that
needs navigation context.

## Bootstrap.tsx
\`\`\`tsx
import { useState } from 'react'
import { BrowserRouter }      from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, NotificationProvider } from '@geomak/ui'
import '@geomak/ui/styles'
import { BRAND_TOKENS } from './utils/brandTokens'
import { AppRoutes } from './approutes/AppRoutes'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
})

export function Bootstrap() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | 'system'>('system')

  const toggleDark = () => {
    const next = colorScheme === 'dark' ? 'light' : 'dark'
    setColorScheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <ThemeProvider colorScheme={colorScheme} theme={BRAND_TOKENS} darkTheme={BRAND_TOKENS}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <AppRoutes onToggleDark={toggleDark} colorScheme={colorScheme} />
          </NotificationProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
\`\`\`

## AppRoutes.tsx (SecureLayout + AppShell)
\`\`\`tsx
import { lazy, Suspense, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell, SecureLayout, TopBar, ThemeSwitch, LoadingSpinner, Icon } from '@geomak/ui'

const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const SettingsPage  = lazy(() => import('../pages/SettingsPage'))

interface Props { onToggleDark: () => void; colorScheme: 'light' | 'dark' | 'system' }

export function AppRoutes({ onToggleDark, colorScheme }: Props) {
  const dashRef     = useRef<HTMLSpanElement>(null)
  const settingsRef = useRef<HTMLSpanElement>(null)

  const sidebarSections = [{
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <span ref={dashRef}><Icon.Home size={18} /></span> },
      { label: 'Settings',  href: '/settings',  icon: <span ref={settingsRef}><Icon.Settings size={18} /></span> },
    ],
  }]

  const topBar = (
    <TopBar
      brand={<span className="font-bold">MyApp</span>}
      actions={<ThemeSwitch colorScheme={colorScheme} onChange={onToggleDark} />}
    />
  )

  return (
    <AppShell topBar={topBar} sidebarSections={sidebarSections}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route
            element={
              <SecureLayout
                isAuthenticated={!!localStorage.getItem('token')}
                fallback={<Navigate to="/login" replace />}
                loadingFallback={null}
              />
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings"  element={<SettingsPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}
\`\`\`

## brandTokens.ts
\`\`\`ts
export const BRAND_TOKENS: Record<string, string> = {
  // Override any OxygenUI CSS custom property:
  // '--color-accent':       '#1A56DB',
  // '--color-accent-hover': '#1e429f',
}
\`\`\`

## main.tsx
\`\`\`tsx
import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'
import { Bootstrap }   from './Bootstrap'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Bootstrap />
  </StrictMode>,
)
\`\`\``,
}

const COMPARE_DATA: Record<string, string> = {
  'modal+drawer': `# Modal vs Drawer

## Modal
- Use when: action needs full attention; background context doesn't help
- Use when: confirmation dialogs, standalone forms, alerts
- Behaviour: dims the entire background, user must act before returning
- Width: capped, centred in the viewport

## Drawer
- Use when: user benefits from seeing the page behind (row inspector, filter panel, quick edit)
- Use when: the task doesn't break the main flow
- Behaviour: slides in from a side; background remains visible and partially interactive
- Placement: left or right (configurable)

## API (identical)
Both use: open + onClose + hasFooter + onOk + onCancel + title

## Rule of thumb
Modal = stop everything. Drawer = side task.`,

  'modal+drawer+popconfirm': `# Modal vs Drawer vs PopConfirm

## PopConfirm
- Use when: confirming a destructive action on a specific row/button (inline, no overlay)
- Not for: complex decisions, forms, or anything that needs detail
- API: onConfirm + onCancel + title; renders inline next to its trigger

## Modal
- Use when: action needs full attention; no background context needed
- Use when: forms, multi-field inputs, important confirmations
- Background: dimmed, blocked

## Drawer
- Use when: side task; user benefits from context behind
- Use when: filter panels, inspectors, quick-edit flows
- Background: visible

## Rule of thumb
Row delete button -> PopConfirm. Form -> Modal. Inspector/filters -> Drawer.`,

  'table+data-grid': `# Table vs DataGrid

## Table
- Standard paginated, sortable, searchable data display
- Supports custom cell renderers, expandable rows, editable cells
- Use for: most data-display needs (90% of cases)

## DataGrid
- Excel-like: column reorder/resize, bulk cell editing, copy-paste
- Higher complexity; requires specific setup for editable columns
- Use for: spreadsheet-style workflows, bulk data entry

## Rule of thumb
Start with Table. Upgrade to DataGrid only when users need spreadsheet behaviour.`,

  'table+data-grid+virtual-list': `# Table vs DataGrid vs VirtualList

## Table
- Built-in pagination, sort, search, expandable rows, editable cells
- DOM renders only visible paginated rows
- Use for: standard data display (up to ~10k rows with pagination)

## DataGrid
- Excel-like: column reorder/resize, bulk edit, copy-paste
- Use for: spreadsheet-style bulk data entry

## VirtualList
- Renders only visible rows via virtual scrolling
- No built-in sort/filter/search; bring your own
- Use for: 10k+ rows where DOM count is the bottleneck (logs, feeds, timelines)

## Rule of thumb
Table first. DataGrid for spreadsheet UX. VirtualList for massive rowsets.`,

  'tabs+segmented-control': `# Tabs vs SegmentedControl

## Tabs
- Three or more sibling content panes
- Content is substantial (forms, tables, long text)
- Variants: underline, enclosed, segmented (styling only)
- Use for: settings sections, detail page sub-views, multi-section dashboards

## SegmentedControl
- Two to four compact mutually exclusive options
- Typically acts as a filter or view-mode toggle, not a content pane switch
- Renders inline without a content area
- Use for: "Week / Month / Year" filter, "List / Grid" toggle, "All / Active / Archived"

## Rule of thumb
Tabs = substantial content switching. SegmentedControl = compact filter/mode toggle.`,
}

// ─── New tool handlers ─────────────────────────────────────────────────────────

function getPattern(pattern: string, entity: string): TextContent[] {
  const key = pattern.toLowerCase().replace(/[^a-z-]/g, '')
  const fn = PATTERNS[key]
  if (!fn) {
    const available = Object.keys(PATTERNS).join(', ')
    return [{ type: 'text', text: `Unknown pattern: "${pattern}".\n\nAvailable patterns: ${available}` }]
  }
  return [{ type: 'text', text: fn(entity || 'Entity') }]
}

function getFormBinding(input: string): TextContent[] {
  const key = input.toLowerCase().replace(/[^a-z]/g, '')
  const hit = FORM_BINDINGS[key]
  if (!hit) {
    const available = Object.keys(FORM_BINDINGS).map(k => k).join(', ')
    return [{
      type: 'text',
      text: `No binding found for "${input}".\n\nKnown inputs: ${available}\n\nFor unlisted inputs, use \`field\` as a safe fallback.`,
    }]
  }
  const note = hit.note ? `\n\n> ${hit.note}` : ''
  return [{
    type: 'text',
    text: `# Form binding for ${input}\n\n**Binder:** \`${hit.binder}\`\n**Value type:** \`${hit.valueType}\`\n\n**Snippet:**\n\`\`\`tsx\n${hit.snippet}\n\`\`\`${note}`,
  }]
}

function compareComponents(components: string[]): TextContent[] {
  const key = components.map(c => c.toLowerCase().replace(/[^a-z]/g, '')).sort().join('+')
  const hit = COMPARE_DATA[key]
  if (hit) return [{ type: 'text', text: hit }]

  // Partial match: find entries that contain all requested components
  const partial = Object.entries(COMPARE_DATA).find(([k]) =>
    components.every(c => k.includes(c.toLowerCase().replace(/[^a-z]/g, '')))
  )
  if (partial) return [{ type: 'text', text: partial[1] }]

  const available = Object.keys(COMPARE_DATA).map(k => k.replace(/\+/g, ' vs ')).join(', ')
  return [{
    type: 'text',
    text: `No comparison found for [${components.join(', ')}].\n\nAvailable comparisons: ${available}`,
  }]
}

function getAppBootstrap(opts: {
  router?: boolean
  reactQuery?: boolean
  customTheme?: boolean
  appName?: string
}): TextContent[] {
  const fn = PATTERNS['app-bootstrap']
  return [{ type: 'text', text: fn(opts.appName || 'MyApp') }]
}

// ─── JSON-RPC dispatch ────────────────────────────────────────────────────────

function ok(id: string | number | null, result: unknown): JsonRpcResponse {
  return { jsonrpc: '2.0', id, result }
}

function rpcError(id: string | number | null, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: '2.0', id, error: { code, message } }
}

function toolOk(id: string | number | null, content: TextContent[]): JsonRpcResponse {
  return ok(id, { content })
}

async function dispatch(req: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  // Notifications (no id) expect no response
  if (!('id' in req) || req.method.startsWith('notifications/')) return null

  const id = req.id ?? null

  switch (req.method) {
    case 'initialize':
      return ok(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'oxygen-ui', version: '1.0.0' },
      })

    case 'ping':
      return ok(id, {})

    case 'tools/list':
      return ok(id, { tools: TOOLS })

    case 'tools/call': {
      const p = req.params as { name?: string; arguments?: Record<string, string> } | undefined
      if (!p?.name) return rpcError(id, -32602, 'Missing params.name')
      const args = p.arguments ?? {}

      switch (p.name) {
        case 'list_components':    return toolOk(id, listComponents())
        case 'get_component':      return toolOk(id, getComponent(args.slug ?? ''))
        case 'find_component':     return toolOk(id, findComponent(args.query ?? ''))
        case 'get_token':          return toolOk(id, getToken(args.token ?? ''))
        case 'get_pattern':        return toolOk(id, getPattern(args.pattern ?? '', args.entity ?? ''))
        case 'get_form_binding':   return toolOk(id, getFormBinding(args.input ?? ''))
        case 'compare_components': return toolOk(id, compareComponents((p.arguments as { components?: string[] })?.components ?? []))
        case 'get_app_bootstrap':  return toolOk(id, getAppBootstrap({ router: !!args.router, reactQuery: !!args.reactQuery, customTheme: !!args.customTheme, appName: args.appName }))
        default:                   return rpcError(id, -32601, `Unknown tool: "${p.name}"`)
      }
    }

    default:
      return rpcError(id, -32601, `Method not found: "${req.method}"`)
  }
}

// ─── HTTP handler ─────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body: JsonRpcRequest
  try {
    body = (await req.json()) as JsonRpcRequest
  } catch {
    return Response.json(
      rpcError(null, -32700, 'Parse error: invalid JSON'),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const result = await dispatch(body)

  if (result === null) {
    return new Response(null, { status: 202, headers: CORS_HEADERS })
  }

  return Response.json(result, {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

export const config = { path: '/mcp' }
