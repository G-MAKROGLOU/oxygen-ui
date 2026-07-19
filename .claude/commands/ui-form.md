---
description: Generate a fully-wired OxygenUI Form from a field specification
---

Generate a wired OxygenUI form for: **$ARGUMENTS**

Parse the argument as a space-separated list of `field-name:input-type` pairs.
Append `?` to mark a field as optional (no required rule). Examples:

```
email:text name:text role:dropdown notify:switch terms:checkbox
start:date end:date priority:slider tags:tags
```

Supported input types: `text`, `textarea`, `password`, `number`, `email`,
`dropdown`, `switch`, `checkbox`, `radio`, `slider`, `date`, `daterange`,
`time`, `tags`, `color`, `rating`, `autocomplete`, `treeselect`

## Steps

1. **Resolve binders**: For each field, call the `oxygen-ui` MCP tool
   `get_form_binding` with the input type. This returns the correct binder
   method, value type, and a paste-ready snippet.

2. **Generate the form component**: Produce a self-contained React component:
   - `useForm` with `defaultValues` typed to match each field
   - One `FormField` per field with the correct binder
   - Required rules on all non-optional (`?`) fields
   - Email pattern rule if the type is `email`
   - A submit `Button`
   - `onFinish` stub with a `TODO` comment

3. **Output inline**: Deliver the component as a code block. Do not write to a
   file unless the user explicitly asks to save it.

4. **Offer next steps**: After the form, suggest:
   - Adding the form inside a Modal (`/ui-modal form-in-modal`)
   - Making it part of a full page (`/ui-page crud EntityName`)
