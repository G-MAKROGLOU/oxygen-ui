---
description: Generate a complete authenticated app shell with SecureLayout, sidebar, routing, and optional Wizard tour
---

Generate an authenticated app shell for: **$ARGUMENTS**

Parse the argument as `[AppName] [route1,route2,...]`. Examples:
```
VesOPS dashboard,vessels,settings,reports
MyApp dashboard,users
```

AppName defaults to `App`. Routes default to `dashboard,settings`.

## What this generates

A single `AppRoutes.tsx` file (or updates an existing one) with:

- `AppShell` with `TopBar` (brand + `ThemeSwitch`) and `sidebarSections`
- `SecureLayout` parent route guarding all provided routes
- Lazy-loaded placeholder pages for each route
- `useRef` arrays + icon wrapper spans for a `Wizard` onboarding tour
- A `Wizard` wrapping `AppShell` with `storageKey` based on the app name

## Steps

1. **Fetch the bootstrap code**: Call `get_app_bootstrap` with `router: true`
   and the app name to get the reference implementation.

2. **Call `get_component` for `secure-layout`** to confirm current prop names
   (isAuthenticated, fallback, loadingFallback).

3. **Generate `AppRoutes.tsx`** with:
   - One `useRef<HTMLSpanElement>` per route for the Wizard tour
   - `sidebarSections` array with one item per route; icon is a `<span ref={...}>` wrapping
     an appropriate `<Icon.*>` (pick the most relevant icon per route name)
   - `wizardSteps` array with title + description for each route
   - `SecureLayout` wrapping all provided routes as child routes
   - Each route uses `lazy(() => import('../pages/RouteNamePage'))` with a `Suspense` fallback
   - `Wizard` wrapping `AppShell` with `steps={wizardSteps}` and `storageKey="{appName}-tour"`

4. **Generate stub page files** for each route under `src/pages/` (e.g. `DashboardPage.tsx`)
   if they do not already exist. Each stub is a minimal component with a heading.

5. **Report** what was created and list:
   - Which icons were guessed (developer may want to swap them)
   - How to wire real authentication (what to replace the placeholder check with)
   - How to add a route: duplicate an entry in `sidebarSections`, add a `useRef`, add a `wizardStep`, add a `<Route>`
