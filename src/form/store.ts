import { deepClone, getPath, setPath } from './path'
import { runFieldRules, type FieldRules, type FormValues, type RulesMap } from './validate'

export type ValidateTrigger = 'onChange' | 'onBlur' | 'onSubmit'

export interface FormStoreOptions {
    initialValues?: FormValues
    /** Static rules keyed by field name. Dynamic fields register their own. */
    rules?: RulesMap
    /**
     * When a field revalidates. `'onSubmit'` is always implied. Default
     * `['onChange', 'onBlur', 'onSubmit']` — error appears once a field is
     * touched and updates live as the user types.
     */
    validateOn?: ValidateTrigger[]
}

export type ErrorMap = Record<string, string | undefined>

/** Stable per-field view handed to subscribers; ref only changes on real change. */
export interface FieldSnapshot {
    value: unknown
    error: string | undefined
    /** touched OR the form was submitted — i.e. "should the error be shown". */
    showError: boolean
}

/**
 * Framework-agnostic form store. Holds values/errors/touched, runs validation,
 * and notifies React via `useSyncExternalStore`. Field components subscribe to
 * a memoized per-field snapshot so a keystroke in one field doesn't re-render
 * the others.
 */
export class FormStore {
    private listeners = new Set<() => void>()
    private fieldCache = new Map<string, { value: unknown; error: string | undefined; showError: boolean; snap: FieldSnapshot }>()

    values: FormValues
    errors: ErrorMap = {}
    touched: Record<string, boolean> = {}
    submitted = false
    /** True while async field validation runs. */
    validating = false
    /** True while the submit handler (`onFinish` / `action`) is executing. */
    submitting = false

    readonly initialValues: FormValues
    private rules: RulesMap
    readonly validateOn: ValidateTrigger[]

    // Field-array key bookkeeping (stable React keys across reorder/removal).
    private keys: Record<string, number[]> = {}
    private keySeq = 1

    // Root snapshot — a new ref on every change, for form-level subscribers.
    private rootSnap: { v: number } = { v: 0 }

    constructor(opts: FormStoreOptions = {}) {
        this.initialValues = deepClone(opts.initialValues ?? {})
        this.values = deepClone(opts.initialValues ?? {})
        this.rules = { ...(opts.rules ?? {}) }
        this.validateOn = opts.validateOn ?? ['onChange', 'onBlur', 'onSubmit']
    }

    // ── subscription ────────────────────────────────────────────────────────
    subscribe = (l: () => void): (() => void) => {
        this.listeners.add(l)
        return () => { this.listeners.delete(l) }
    }
    private emit() {
        this.rootSnap = { v: this.rootSnap.v + 1 }
        this.listeners.forEach((l) => l())
    }
    getRootSnapshot = (): { v: number } => this.rootSnap

    getFieldSnapshot = (name: string): FieldSnapshot => {
        const value = getPath(this.values, name)
        const error = this.errors[name]
        const showError = (!!this.touched[name] || this.submitted) && error != null
        const prev = this.fieldCache.get(name)
        if (prev && Object.is(prev.value, value) && prev.error === error && prev.showError === showError) {
            return prev.snap
        }
        const snap: FieldSnapshot = { value, error, showError }
        this.fieldCache.set(name, { value, error, showError, snap })
        return snap
    }

    // ── rule registry (for dynamic / array fields) ──────────────────────────
    setRule(name: string, rules: FieldRules | undefined) {
        if (rules == null) delete this.rules[name]
        else this.rules[name] = rules
    }
    removeRule(name: string) { delete this.rules[name] }
    getRule(name: string): FieldRules | undefined { return this.rules[name] }

    // ── reads ────────────────────────────────────────────────────────────────
    getValues = (): FormValues => this.values
    getValue = (name: string): unknown => getPath(this.values, name)
    get isValid(): boolean { return Object.values(this.errors).every((e) => !e) }

    // ── writes ────────────────────────────────────────────────────────────────
    setValue = (name: string, value: unknown, opts: { validate?: boolean; touch?: boolean } = {}) => {
        this.values = setPath(this.values, name, value)
        if (opts.touch) this.touched = { ...this.touched, [name]: true }
        this.emit()
        const shouldValidate = opts.validate ?? this.validateOn.includes('onChange')
        if (shouldValidate) void this.validateField(name)
    }

    setValues = (patch: FormValues, opts: { validate?: boolean } = {}) => {
        for (const k of Object.keys(patch)) this.values = setPath(this.values, k, patch[k])
        this.emit()
        if (opts.validate) void this.validateAll()
    }

    setError = (name: string, error: string | undefined) => {
        if (this.errors[name] === error) return
        this.errors = { ...this.errors, [name]: error || undefined }
        this.emit()
    }

    touch = (name: string, opts: { validate?: boolean } = {}) => {
        if (!this.touched[name]) {
            this.touched = { ...this.touched, [name]: true }
            this.emit()
        }
        if (opts.validate ?? this.validateOn.includes('onBlur')) void this.validateField(name)
    }

    setSubmitted = (v: boolean) => { this.submitted = v; this.emit() }
    setSubmitting = (v: boolean) => { this.submitting = v; this.emit() }

    // ── validation ─────────────────────────────────────────────────────────────
    async validateField(name: string): Promise<string | undefined> {
        const err = await runFieldRules(getPath(this.values, name), this.rules[name], this.values)
        this.setError(name, err)
        return err
    }

    async validateAll(): Promise<ErrorMap> {
        this.validating = true
        this.emit()
        const names = Object.keys(this.rules)
        const entries = await Promise.all(
            names.map(async (n) => [n, await runFieldRules(getPath(this.values, n), this.rules[n], this.values)] as const),
        )
        const errors: ErrorMap = {}
        for (const [n, e] of entries) errors[n] = e
        this.errors = errors
        this.validating = false
        this.emit()
        return errors
    }

    reset = (values?: FormValues) => {
        this.values = deepClone(values ?? this.initialValues)
        this.errors = {}
        this.touched = {}
        this.submitted = false
        this.submitting = false
        this.keys = {}
        this.fieldCache.clear()
        this.emit()
    }

    // ── field arrays ───────────────────────────────────────────────────────────
    getKeys(name: string): number[] {
        const arr = (getPath(this.values, name) as unknown[]) ?? []
        let keys = this.keys[name]
        if (!keys || keys.length !== arr.length) {
            keys = arr.map((_, i) => (keys && keys[i] != null ? keys[i] : this.keySeq++))
            this.keys[name] = keys
        }
        return keys
    }
    arrayAppend = (name: string, item: unknown = {}) => {
        const arr = [...((getPath(this.values, name) as unknown[]) ?? [])]
        arr.push(item)
        this.keys[name] = [...this.getKeys(name), this.keySeq++]
        this.setValue(name, arr, { validate: false })
    }
    arrayRemove = (name: string, index: number) => {
        const arr = [...((getPath(this.values, name) as unknown[]) ?? [])]
        arr.splice(index, 1)
        const k = [...this.getKeys(name)]
        k.splice(index, 1)
        this.keys[name] = k
        // Re-index errors/touched for the removed branch so stale messages clear.
        this.clearBranch(name)
        this.setValue(name, arr, { validate: false })
    }
    arrayMove = (name: string, from: number, to: number) => {
        const arr = [...((getPath(this.values, name) as unknown[]) ?? [])]
        if (from < 0 || to < 0 || from >= arr.length || to >= arr.length) return
        const [moved] = arr.splice(from, 1)
        arr.splice(to, 0, moved)
        const k = [...this.getKeys(name)]
        const [mk] = k.splice(from, 1)
        k.splice(to, 0, mk)
        this.keys[name] = k
        this.clearBranch(name)
        this.setValue(name, arr, { validate: false })
    }

    /** Drop any errors/touched flags under `name.` — used when an array shifts. */
    private clearBranch(name: string) {
        const prefix = name + '.'
        const errors: ErrorMap = {}
        for (const k of Object.keys(this.errors)) if (!k.startsWith(prefix)) errors[k] = this.errors[k]
        const touched: Record<string, boolean> = {}
        for (const k of Object.keys(this.touched)) if (!k.startsWith(prefix)) touched[k] = this.touched[k]
        this.errors = errors
        this.touched = touched
    }
}
