/**
 * Native, dependency-free validation. A field carries one rule or an array of
 * rules; rules run in order and the first failure wins. Rules are plain data
 * (required / pattern / min / max / length) plus an escape hatch `validate`
 * for anything custom — including async checks (uniqueness, server lookups) and
 * third-party schemas: `validate: (v) => zodSchema.safeParse(v).success ? undefined : 'msg'`.
 */

export type FormValues = Record<string, unknown>

/** A numeric/length constraint, optionally with its own message. */
type Bound = number | { value: number; message?: string }
/** A regex constraint, optionally with its own message. */
type Pattern = RegExp | { value: RegExp; message?: string }

export interface FieldRule<V = unknown> {
    /** Reject empty values. Pass a string to set the message. */
    required?: boolean | string
    /** Reject strings that don't match. */
    pattern?: Pattern
    /** Minimum numeric value. */
    min?: Bound
    /** Maximum numeric value. */
    max?: Bound
    /** Minimum length for strings / arrays. */
    minLength?: Bound
    /** Maximum length for strings / arrays. */
    maxLength?: Bound
    /**
     * Custom validator. Return an error string to fail, or a falsy value to
     * pass. May be async. Receives the field value and the whole form's values
     * (for cross-field checks like "confirm password").
     */
    validate?: (
        value: V,
        values: FormValues,
    ) => string | undefined | null | false | Promise<string | undefined | null | false>
    /** Fallback message used by required/pattern when they don't set their own. */
    message?: string
}

export type FieldRules<V = unknown> = FieldRule<V> | FieldRule<V>[]
export type RulesMap = Record<string, FieldRules>

/** Empty = no value to validate against (null / '' / [] / unchecked). */
function isEmpty(v: unknown): boolean {
    return (
        v == null ||
        v === '' ||
        v === false ||
        (Array.isArray(v) && v.length === 0)
    )
}

const boundValue = (b: Bound) => (typeof b === 'number' ? b : b.value)
const boundMessage = (b: Bound, fallback: string) =>
    typeof b === 'number' ? fallback : b.message ?? fallback

/** Does this rule set make the field required? (drives the `*` asterisk.) */
export function isRequired(rules: FieldRules | undefined): boolean {
    if (!rules) return false
    const list = Array.isArray(rules) ? rules : [rules]
    return list.some((r) => !!r.required)
}

/**
 * Run a field's rules and resolve the first error message, or `undefined` when
 * valid. Optional-and-empty fields short-circuit to valid (only `required`
 * fires on empty).
 */
export async function runFieldRules(
    value: unknown,
    rules: FieldRules | undefined,
    values: FormValues,
): Promise<string | undefined> {
    if (!rules) return undefined
    const list = Array.isArray(rules) ? rules : [rules]

    for (const rule of list) {
        if (rule.required && isEmpty(value)) {
            return typeof rule.required === 'string'
                ? rule.required
                : rule.message ?? 'This field is required'
        }

        // Optional + empty → nothing else to check for this rule.
        if (isEmpty(value)) {
            // still allow a custom validator to opt in on empty values
            if (rule.validate) {
                const res = await rule.validate(value as never, values)
                if (res) return typeof res === 'string' ? res : rule.message ?? 'Invalid value'
            }
            continue
        }

        if (rule.pattern) {
            const re = rule.pattern instanceof RegExp ? rule.pattern : rule.pattern.value
            const msg =
                rule.pattern instanceof RegExp
                    ? rule.message ?? 'Invalid format'
                    : rule.pattern.message ?? rule.message ?? 'Invalid format'
            if (typeof value === 'string' && !re.test(value)) return msg
        }

        if (rule.min != null && typeof value === 'number') {
            const m = boundValue(rule.min)
            if (value < m) return boundMessage(rule.min, rule.message ?? `Must be at least ${m}`)
        }
        if (rule.max != null && typeof value === 'number') {
            const m = boundValue(rule.max)
            if (value > m) return boundMessage(rule.max, rule.message ?? `Must be at most ${m}`)
        }

        if (rule.minLength != null) {
            const len = (value as { length?: number })?.length
            const m = boundValue(rule.minLength)
            if (typeof len === 'number' && len < m)
                return boundMessage(rule.minLength, rule.message ?? `Must be at least ${m} characters`)
        }
        if (rule.maxLength != null) {
            const len = (value as { length?: number })?.length
            const m = boundValue(rule.maxLength)
            if (typeof len === 'number' && len > m)
                return boundMessage(rule.maxLength, rule.message ?? `Must be at most ${m} characters`)
        }

        if (rule.validate) {
            const res = await rule.validate(value as never, values)
            if (res) return typeof res === 'string' ? res : rule.message ?? 'Invalid value'
        }
    }

    return undefined
}

/** Common ready-made patterns so callers don't re-type regexes. */
export const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
    // Loose international phone: + and 7-15 digits, spaces/dashes allowed.
    phone: /^\+?[\d\s-]{7,15}$/,
    // Digits only.
    digits: /^\d+$/,
} as const
