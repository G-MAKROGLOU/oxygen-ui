import type React from 'react'
import type { FormStore, FieldSnapshot } from './store'
import { isRequired } from './validate'

/**
 * How a control reports changes, so one binder can drive any of our inputs:
 * - `value`   — `onChange(value)` directly (RadioGroup, Slider, Rating,
 *               SegmentedControl, TagsInput, OtpInput, DatePicker, ColorPicker…)
 * - `native`  — `onChange(e)` reading `e.target.value` (TextInput, Password,
 *               TextArea, NumberInput, SearchInput)
 * - `checked` — `onChange({target:{checked}})` (Switch, Checkbox)
 * - `target`  — `onChange({target:{value}})` (Dropdown, TreeSelect)
 */
export type FieldKind = 'value' | 'native' | 'checked' | 'target'

interface Adapter {
    prop: 'value' | 'checked'
    toValue: (arg: unknown) => unknown
    /** Apply an empty fallback so native inputs stay controlled. */
    applyEmpty: boolean
    empty: unknown
}

const getTarget = (arg: unknown): Record<string, unknown> | undefined => {
    const t = (arg as { target?: unknown })?.target
    return t && typeof t === 'object' ? (t as Record<string, unknown>) : undefined
}

const ADAPTERS: Record<FieldKind, Adapter> = {
    value: { prop: 'value', toValue: (v) => v, applyEmpty: false, empty: undefined },
    native: { prop: 'value', toValue: (e) => getTarget(e)?.value, applyEmpty: true, empty: '' },
    checked: { prop: 'checked', toValue: (e) => getTarget(e)?.checked, applyEmpty: true, empty: false },
    target: { prop: 'value', toValue: (e) => getTarget(e)?.value, applyEmpty: false, empty: undefined },
}

export interface FieldBindings {
    name: string
    id: string
    htmlFor: string
    required?: boolean
    errorMessage?: React.ReactNode
    onChange: (arg: unknown) => void
    onBlur: () => void
    /** `value` or `checked`, depending on the control kind. */
    [prop: string]: unknown
}

/**
 * Produce the props to spread onto a control: the current value (under the
 * right prop), a normalising `onChange`, `onBlur` to mark touched, the field
 * `name`/`id`, the derived `required` flag (from its rules), and the gated
 * `errorMessage` (shown once touched or after a submit attempt).
 */
export function buildBindings(
    store: FormStore,
    name: string,
    kind: FieldKind,
    snap: FieldSnapshot,
): FieldBindings {
    const a = ADAPTERS[kind]
    const raw = snap.value
    const value = a.applyEmpty ? raw ?? a.empty : raw
    return {
        name,
        id: name,
        htmlFor: name,
        required: isRequired(store.getRule(name)) || undefined,
        errorMessage: snap.showError ? snap.error : undefined,
        [a.prop]: value,
        onChange: (arg: unknown) => store.setValue(name, a.toValue(arg), { touch: true }),
        onBlur: () => store.touch(name),
    }
}
