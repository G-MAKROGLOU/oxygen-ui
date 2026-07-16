---
description: Add or improve Storybook stories for an existing OxygenUI component
---

Add or improve Storybook stories for the OxygenUI component: **$ARGUMENTS**

## Steps

1. **Read the component** — Find and read:
   - The component source file (`src/components/**/$ARGUMENTS.tsx` or similar)
   - The existing story file if one exists
   - The MDX guide if one exists in `src/docs/`

2. **Identify gaps** — Look for:
   - Props that have no story coverage
   - State combinations (loading, error, empty, disabled)
   - Controlled vs uncontrolled usage
   - Composition patterns (compound components with sub-components)
   - Responsive or theme-sensitive behaviour

3. **Write stories** following the CSF3 format used throughout the codebase:
   - `Default` — the simplest working example with sensible args
   - One story per major variant or visual state
   - Use `render` functions for complex compositions
   - Use `play` functions only when testing interactions (focus, type, click)
   - Prefer realistic content that reflects actual usage in the VesOPS portal

4. **Verify** that story `title` matches the existing Storybook sidebar path.

5. **Report** which stories were added and what each one demonstrates.
