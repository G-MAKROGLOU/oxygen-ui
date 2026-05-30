# Inputs Roadmap — coverage vs. AntD / MUI / Mantine

Snapshot of what `@geomak/ui` ships today versus the input surface of the
mature libraries, with a priority ranking for what to build next.

## Have today

| Input | Notes |
|---|---|
| TextInput | text/email/url/tel, prefix/suffix adornments, sizes, error |
| Password | reveal toggle, icon overrides |
| SearchInput | `type=search`, leading icon override |
| NumberInput | keyboard steppers, FP-safe precision, min/max |
| Dropdown | single + multi select, search, sizes |
| AutoComplete | static + async (`onSearch` + debounce + spinner) |
| TreeSelect | hierarchical single-select, keyboard tree nav |
| DatePicker | grid calendar, month/year quick-pick, min/max |
| Checkbox | Radix, indeterminate-capable |
| Switch | Radix, icon thumbs |
| RadioGroup | **new** — Radix, descriptions, orientation |
| FileInput | **redesigned** — DnD, chips, size validation |

All share the new field foundation: refined focus, size scale, semantic
tokens, `<Field>` label/error layout, responsive `w-full`.

## Missing — prioritised

### P0 — expected in any "complete" library, build first

1. **TextArea** — multi-line text. Auto-grow option, char counter, max rows.
   Trivial against the foundation. (AntD `Input.TextArea`, MUI multiline.)
2. **Slider** — single value + range (two thumbs). Marks, step, tooltip on
   drag. Radix `react-slider` exists — wrap it. High demand for settings/filters.
3. **Combobox / multi-tag input** — free-text entry that produces removable
   tags (emails, keywords). Distinct from Dropdown (which picks from a fixed
   list). AntD `Select mode="tags"`, Mantine `TagsInput`.
4. **SegmentedControl** — we have ToggleButton (icon segments); a text-first
   segmented control for 2–4 mutually exclusive options (view switchers,
   billing period). Radix `react-toggle-group` already a dep.

### P1 — common, build once P0 lands

5. **TimePicker** — hour/minute (optional seconds), 12/24h. Pairs with
   DatePicker; share the popover + grid scaffolding.
6. **DateRangePicker** — two-month range selection. Extends DatePicker.
7. **OTP / PIN input** — segmented one-time-code boxes with auto-advance +
   paste-spread. Very common for auth flows; small, high-polish win.
8. **Rating** — star (or custom glyph) rating, half-steps, read-only mode.
9. **ColorPicker** — swatch + popover with hue/alpha. Heavier; consider
   wrapping an existing headless picker rather than hand-rolling.

### P2 — specialised, build on demand

10. **Mentions** — `@`-triggered inline autocomplete inside a textarea.
11. **Cascader** — column-by-column hierarchical select (TreeSelect covers
    most of this need already).
12. **Transfer** — dual-list shuttle (available ↔ selected).
13. **Mask / formatted input** — phone, currency, card number masking.
14. **InputGroup / addon composition** — formal API for prefix/suffix
    buttons + selects attached to an input (we have ad-hoc prefix/suffix
    on TextInput; a group primitive generalises it).

## Unified components (not standalone inputs)

Some "inputs" only make sense as part of a larger composite and must NOT be
exposed individually:

- **CreditCardForm** — card number (type detection + Luhn validation), expiry
  (MM/YY parsing), CVV, cardholder name. A CVV field has no use outside this
  form. Build as one `<CreditCardForm>` component **after the Form API
  (FormProvider / useForm / useFormField)** lands, so it gets cross-field
  validation and submission for free. Do not ship `<CvvInput>` and friends.

## Form API — SHIPPED

Zero-dependency form layer under `src/form` (exported from the package root):

- `useForm({ initialValues, rules, validateOn })` → store + bindings.
- `<Form form onFinish onFinishFailed action>` owns submission. `onFinish`
  for SPA; `action` (server-action function or native URL) for SSR — both
  validate first, native submits await async rules via `requestSubmit`.
- Bind any control by spreading a kind-specific binder:
  `fieldNative` (text inputs), `fieldChecked` (Switch/Checkbox),
  `fieldTarget` (Dropdown/TreeSelect), `field` (value-onChange controls).
- Validation is native + at the form level — inputs only *receive* their
  error. Rules: `required`, `pattern`, `min`/`max`, `minLength`/`maxLength`,
  and async/custom `validate` (Zod via `validate: v => schema.safeParse(v)…`).
  Timing: onChange (once touched) + onBlur + onSubmit.
- `useFieldArray(name)` → `{ fields, append, remove, move, replace }` with
  stable keys for AntD-style dynamic add/remove rows; per-row rules register
  and clean up via `useFormField`.
- `useFormField` / `<FormField>` isolate re-renders for large/dynamic forms
  (per-field memoized snapshots over `useSyncExternalStore`).

Every input already exposes the unified form surface (value/onChange, name,
label, layout, helperText, required, disabled, errorMessage).

## Status

- **P0 — DONE:** TextArea, Slider (single + range), TagsInput, SegmentedControl.
- **P1 — DONE:** TimePicker, DateRangePicker, OTP/PIN, Rating, ColorPicker.
- **Form API — DONE:** useForm / Form / field binders / validation / field arrays.
- **Next:** CreditCardForm (built on the Form API), then Calendar, Accordion,
  Table expandable-row animation, marketing component suite.
