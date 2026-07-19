import { useEffect, useSyncExternalStore } from 'react'
import { useFormStore } from './context'
import { buildBindings, type FieldBindings, type FieldKind } from './bindings'
import type { FieldRules } from './validate'

export interface UseFormFieldOptions {
    /** How the control reports changes. Default `'value'`. */
    kind?: FieldKind
    /** Rules for this field, registered on the form (and cleaned up on unmount). */
    rules?: FieldRules
}

/**
 * Subscribe a single field to the enclosing `<Form>`. Unlike reading bindings
 * off `useForm()`, this isolates re-renders to just this field via a memoized
 * per-field snapshot, the right choice for large or dynamic forms. Registering
 * `rules` here also unregisters them on unmount, which is what makes field
 * arrays validate correctly as rows come and go.
 *
 * @example
 * const email = useFormField('email', { kind: 'native', rules: { required: true } })
 * <TextInput label="Email" {...email} />
 */
export function useFormField(name: string, options: UseFormFieldOptions = {}): FieldBindings {
    const store = useFormStore()
    const { kind = 'value', rules } = options

    // Register during render (idempotent) so `required` + submit validation see
    // the rule immediately; clean up on unmount so removed array rows don't
    // leave dangling rules behind.
    if (rules !== undefined && store.getRule(name) !== rules) store.setRule(name, rules)
    useEffect(() => {
        return () => { if (rules !== undefined) store.removeRule(name) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store, name])

    const snap = useSyncExternalStore(
        store.subscribe,
        () => store.getFieldSnapshot(name),
    )
    return buildBindings(store, name, kind, snap)
}
