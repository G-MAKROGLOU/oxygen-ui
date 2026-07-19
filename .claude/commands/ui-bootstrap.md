---
description: Generate the full app bootstrap for a new project using OxygenUI
---

Bootstrap a new app using OxygenUI: **$ARGUMENTS**

Parse the argument as an optional app name (e.g. `MyApp`, `VesOPS`). Defaults to `App`.

## What this generates

Four files that give a new project a working, production-ready shell:

| File | Purpose |
|---|---|
| `src/main.tsx` | Entry point, mounts Bootstrap into the DOM |
| `src/Bootstrap.tsx` | Full provider stack in the correct nesting order |
| `src/approutes/AppRoutes.tsx` | AppShell + SecureLayout + lazy routes skeleton |
| `src/utils/brandTokens.ts` | Token override object for custom branding |

## Steps

1. **Fetch the bootstrap code**: Call the `oxygen-ui` MCP tool `get_app_bootstrap`
   with `router: true`, `reactQuery: true`, `customTheme: true`, and the app name.

2. **Check what exists**: Before writing, check if any of the four target files
   already exist. If they do, report the conflict and ask the user how to proceed
   rather than overwriting.

3. **Write the four files** with the content from the tool, substituting the app name
   throughout (component names, display strings, localStorage keys).

4. **Report** what was created and list the next steps:
   - Add real routes to `AppRoutes.tsx`
   - Wire real authentication (replace the `localStorage.getItem('token')` check)
   - Populate `BRAND_TOKENS` if custom branding is needed
   - Run `yarn add @tanstack/react-query react-router-dom` if not already installed
