---
description: Search OxygenUI for components matching a description or use-case
---

Search OxygenUI for components that match: **$ARGUMENTS**

1. Call the `oxygen-ui` MCP tool `find_component` with the argument as the query.
2. Present the results as a concise table: **Name** · slug · category · description.
3. For the top 1-2 results, briefly describe why they match and what the user
   should look for in the docs (e.g. key props, integration patterns).
4. If the search finds nothing, suggest alternative queries and offer to call
   `list_components` to browse all available entries.
