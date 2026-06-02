export type ClassValue = string | number | false | null | undefined

/**
 * Join class names, dropping falsy values — a tiny `clsx` for the design system.
 * Replaces the repeated `[a, b].filter(Boolean).join(' ')` idiom with a clearer,
 * allocation-light call.
 *
 * @example
 * cx('btn', isActive && 'btn-active', disabled ? 'opacity-50' : null)
 * // → 'btn btn-active' (when isActive, not disabled)
 */
export function cx(...values: ClassValue[]): string {
    let out = ''
    for (const value of values) {
        if (!value) continue
        out += (out && ' ') + value
    }
    return out
}
