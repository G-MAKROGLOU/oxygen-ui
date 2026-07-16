---
description: Scaffold a new OxygenUI component — implementation + story + MDX guide
---

Scaffold a new OxygenUI component named: **$ARGUMENTS**

Parse the argument as `ComponentName [category]` where category is optional
(defaults to the most appropriate one based on the component name).

## Steps

1. **Plan** — Determine:
   - Target directory: `src/components/{core|inputs|forms|layout|marketing}/`
   - Story title: `"Category/ComponentName"`
   - Whether the component wraps a Radix primitive or is fully custom

2. **Check for overlap** — Call `find_component` to confirm no existing component
   already covers this use case before creating anything.

3. **Scaffold files** — Create the following three files:

### `ComponentName.tsx`

```tsx
import React from 'react'

export interface ComponentNameProps {
  // props here
  className?: string
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={className}>
      {/* implementation */}
    </div>
  )
}

export default ComponentName
```

### `ComponentName.stories.tsx`

```tsx
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import ComponentName from './ComponentName'

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof ComponentName>

export const Default: Story = {
  args: {},
}
```

### `src/docs/ComponentName.mdx`

Use the MDX guide structure with HTML tables (not GFM markdown tables).
Use the exported `th / td / td0 / tbl` style constants from Accordion.mdx as a template.

4. **Export** — Add the new component to `src/index.ts` in the correct section
   (Core components, Input components, etc.).

5. **Report** what was created and what the developer should fill in next
   (implementation logic, additional stories, tests).
