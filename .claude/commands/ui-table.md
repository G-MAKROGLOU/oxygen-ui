---
description: Generate a typed OxygenUI Table component with columns, actions, and optional CRUD wiring
---

Generate a typed Table for: **$ARGUMENTS**

Parse the argument as `EntityName [col:type ...]`. Column type hints are optional.
Examples:

```
Vessel name:string flag:string dwt:number status:badge actions:menu
Order id:number customer:string total:number status:badge
User
```

Column types: `string`, `number`, `boolean`, `badge`, `date`, `link`, `menu`
- `badge` renders a `<Badge>` with tone based on the value
- `menu` adds an actions column with Edit and Delete buttons + PopConfirm on delete
- Any unlisted type defaults to a plain text renderer

## Steps

1. **Fetch Table API**: Call `get_component` with slug `table` to confirm the
   exact `TableColumn<T>` shape and any props that have changed.

2. **Generate the component**: Produce:
   - TypeScript interface for the entity with all specified columns
   - `TableColumn<Entity>[]` array with correct renderers for typed columns
   - For `badge` columns: a `<Badge>` renderer with a sensible tone map
   - For `menu` columns: Edit button + PopConfirm-wrapped Delete button, wired to
     `onEdit` and `onDelete` callback props
   - Table component with `hasSearch`, `pagination`, and `getRowKey={r => r.id}`

3. **Output inline** as a complete, importable component.

4. **Offer extensions**: After the output, offer to:
   - Add a create/edit Modal + Form (`/ui-modal form-in-modal` or `/ui-page crud EntityName`)
   - Wrap it in a full CRUD page (`/ui-page crud EntityName`)
