---
description: Look up a specific OxygenUI component — full props API and usage examples
---

Look up the OxygenUI component or hook: **$ARGUMENTS**

1. Call the `oxygen-ui` MCP tool `get_component` with the appropriate slug.
   If the slug is not obvious, call `find_component` first with the argument as
   the query, then call `get_component` with the best-matching slug.
2. Return the full documentation clearly formatted — props table, usage examples,
   and any caveats or recipes that are relevant.
3. If the component accepts children or sub-components (e.g. `Modal.Body`),
   highlight the composition pattern.
