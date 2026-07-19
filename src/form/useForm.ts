import { useCallback, useRef, useSyncExternalStore } from 'react'
import { FormStore, type FormStoreOptions, type ErrorMap } from './store'
import { buildBindings, type FieldBindings, type FieldKind } from './bindings'
import type { FieldRules, FormValues } from './validate'

export interface UseFormReturn {
    /** The underlying store, pass to `<Form form={...}>` and for imperative use. */
    store: FormStore
    values: FormValues
    errors: ErrorMap
    touched: Record<string, boolean>
    submitted: boolean
    isSubmitting: boolean
    isValid: boolean

    // imperative helpers
    getValue: (name: string) => unknown
    getValues: () => FormValues
    setValue: (name: string, value: unknown, opts?: { validate?: boolean; touch?: boolean }) => void
    setValues: (patch: FormValues) => void
    setError: (name: string, error: string | undefined) => void
    validateField: (name: string) => Promise<string | undefined>
    validateAll: () => Promise<ErrorMap>
    reset: (values?: FormValues) => void

    /**
     * Bind a control whose `onChange` receives the value directly (RadioGroup,
     * Slider, DatePicker, SegmentedControl, TagsInput, OtpInput, …).
     * Spread the result onto the control: `<Slider {...form.field('volume')} />`.
     */
    field: (name: string, rules?: FieldRules) => FieldBindings
    /** Bind a native input (`e.target.value`): TextInput, Password, TextArea, NumberInput. */
    fieldNative: (name: string, rules?: FieldRules) => FieldBindings
    /** Bind a checkable (`{target:{checked}}`): Switch, Checkbox. */
    fieldChecked: (name: string, rules?: FieldRules) => FieldBindings
    /** Bind a `{target:{value}}` control: Dropdown, TreeSelect. */
    fieldTarget: (name: string, rules?: FieldRules) => FieldBindings
}

/**
 * Create a form instance. State lives in a stable {@link FormStore}; the hook
 * re-renders the calling component on any change so the spread `field()`
 * bindings stay current. For large forms, isolate re-renders with
 * `useFormField` / `<FormField>` instead of reading everything here.
 *
 * Validation lives at the form level (rules map or per-field `rules` arg), and
 * the inputs only *receive* their error, they never validate themselves.
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { email: '' } })
 * <Form form={form} onFinish={(v) => save(v)}>
 *   <TextInput label="Email" {...form.fieldNative('email', { required: true, pattern: patterns.email })} />
 *   <Button type="submit">Save</Button>
 * </Form>
 * ```
 */
export function useForm(options: FormStoreOptions = {}): UseFormReturn {
    const ref = useRef<FormStore | null>(null)
    if (ref.current === null) ref.current = new FormStore(options)
    const store = ref.current

    // Re-render this component whenever the store changes.
    useSyncExternalStore(store.subscribe, store.getRootSnapshot, store.getRootSnapshot)

    const make = useCallback(
        (kind: FieldKind) => (name: string, rules?: FieldRules): FieldBindings => {
            if (rules !== undefined) store.setRule(name, rules)
            return buildBindings(store, name, kind, store.getFieldSnapshot(name))
        },
        [store],
    )

    return {
        store,
        values: store.values,
        errors: store.errors,
        touched: store.touched,
        submitted: store.submitted,
        // True for the whole submit cycle: async validation → onFinish execution.
        isSubmitting: store.submitting || store.validating,
        isValid: store.isValid,

        getValue: store.getValue,
        getValues: store.getValues,
        setValue: (name, value, opts) => store.setValue(name, value, opts),
        setValues: (patch) => store.setValues(patch),
        setError: store.setError,
        validateField: (name) => store.validateField(name),
        validateAll: () => store.validateAll(),
        reset: store.reset,

        field: make('value'),
        fieldNative: make('native'),
        fieldChecked: make('checked'),
        fieldTarget: make('target'),
    }
}
