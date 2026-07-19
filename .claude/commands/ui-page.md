---
description: Scaffold a complete page component using OxygenUI patterns
---

Scaffold a complete page for: **$ARGUMENTS**

Parse the argument as `<type> [EntityName]` where type is one of:
`crud`, `dashboard`, `settings`, `detail`, `multi-step-form`

EntityName is optional (e.g. `crud Vessel`, `detail Order`, `dashboard`).

## Steps

1. **Look up the pattern**: Call the `oxygen-ui` MCP tool `get_pattern` with the type
   and entity name. This returns the full recipe: components needed, state to declare,
   wiring steps, and a complete code example.

2. **Resolve any unfamiliar props**: If the pattern uses a component whose API you are
   not certain about, call `get_component` with the slug before writing code.

3. **Determine the output path**
   - Check if `src/pages/` exists; if not, check `src/views/` or `src/screens/`
   - File name: `{EntityName}Page.tsx` (e.g. `VesselsPage.tsx`, `DashboardPage.tsx`)

4. **Write the file**: Generate the complete, self-contained page component:
   - TypeScript interface for the entity (if applicable)
   - All imports from `@geomak/ui`
   - All state declarations
   - All event handlers wired up (create, edit, delete, save, etc.)
   - Full JSX tree matching the pattern
   - Replace all `api.*` calls with `TODO: replace with your API call`

5. **Report** what was created and list:
   - Which `api.*` calls need to be wired to real endpoints
   - Which types/interfaces need to be expanded
   - Any optional enhancements (e.g. "add Drawer instead of Modal for more context")
