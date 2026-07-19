import { useSyncExternalStore } from 'react'
import { useFormStore } from './context'

export interface FieldArrayItem {
    /** Stable React key, survives reorders and removals. */
    key: number
    /** Dotted base path for this row, e.g. `"contacts.2"`. */
    name: string
    index: number
}

export interface UseFieldArrayReturn {
    fields: FieldArrayItem[]
    /** Append a row (optionally seeded with values). */
    append: (item?: unknown) => void
    /** Remove the row at `index` (clears its errors/touched too). */
    remove: (index: number) => void
    /** Reorder a row. */
    move: (from: number, to: number) => void
    /** Replace the entire array. */
    replace: (items: unknown[]) => void
}

/**
 * Dynamic, AntD-style repeating fields. Returns rows with stable keys plus
 * add/remove/move helpers. Build each row's field names from `field.name`,
 * e.g. `${field.name}.email`.
 *
 * @example
 * const { fields, append, remove } = useFieldArray('contacts')
 * {fields.map((f, i) => (
 *   <div key={f.key}>
 *     <TextInput {...useFormField(`${f.name}.email`, { kind: 'native', rules: { required: true } })} />
 *     <Button onClick={() => remove(i)}>Remove</Button>
 *   </div>
 * ))}
 * <Button onClick={() => append({ email: '' })}>Add contact</Button>
 */
export function useFieldArray(name: string): UseFieldArrayReturn {
    const store = useFormStore()
    useSyncExternalStore(store.subscribe, store.getRootSnapshot, store.getRootSnapshot)

    const arr = (store.getValue(name) as unknown[]) ?? []
    const keys = store.getKeys(name)

    return {
        fields: arr.map((_, i) => ({ key: keys[i], name: `${name}.${i}`, index: i })),
        append: (item: unknown = {}) => store.arrayAppend(name, item),
        remove: (index: number) => store.arrayRemove(name, index),
        move: (from: number, to: number) => store.arrayMove(name, from, to),
        replace: (items: unknown[]) => store.setValue(name, items, { validate: false }),
    }
}
