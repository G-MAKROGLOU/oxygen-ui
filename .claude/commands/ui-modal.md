---
description: Generate the complete state + Modal setup for a named OxygenUI modal pattern
---

Generate a Modal pattern for: **$ARGUMENTS**

Parse the argument as one of: `confirm-delete`, `form-in-modal`, `detail-view`, `alert`

## Patterns

### confirm-delete
State + PopConfirm-style Modal for deleting a named item. Includes:
- `open` + `target` state
- `onDelete(item)` setter
- `onConfirm` async handler with `useNotification` feedback
- Full Modal JSX with cancel/confirm buttons

### form-in-modal
State + Modal containing a Form. Includes:
- `open` + `selected` state (null = create, item = edit)
- `openCreate` / `openEdit(item)` / `closeModal` helpers
- `useEffect` to reset the form when `open` changes
- Form with two example fields (developer fills in actual fields)
- Modal with `onOk={form.submit}` wiring

### detail-view
Read-only Modal that displays a selected item's details. Includes:
- `open` + `item` state
- Trigger pattern
- Modal with a descriptive layout (label/value pairs using Typography)

### alert
Simple informational Modal with a single confirm button and an optional icon.

## Steps

1. **Fetch component API**: Call `get_component` with slug `modal` to confirm
   the current prop names (onClose vs onOpenChange may differ across versions).

2. **Generate the pattern**: Produce the complete code block:
   - State declarations (paste above the return statement)
   - Helper functions
   - The Modal JSX (paste into the render tree)
   - Any supporting imports

3. **Output inline** as a clearly labelled code block with sections:
   `// --- STATE ---`, `// --- HANDLERS ---`, `// --- JSX ---`

4. **Offer next steps**: Suggest wrapping the form-in-modal inside a full
   CRUD page with `/ui-page crud EntityName`.
