/**
 * Tiny immutable path helpers for nested form values — supports dotted paths
 * with numeric segments (e.g. `"users.0.email"`). Zero dependencies; written
 * so field arrays and nested objects "just work" without lodash.
 */

/** Deep-clone preserving Date instances (form values may hold dates). */
export function deepClone<T>(v: T): T {
    if (v === null || typeof v !== 'object') return v
    if (v instanceof Date) return new Date(v.getTime()) as unknown as T
    if (Array.isArray(v)) return v.map(deepClone) as unknown as T
    const out: Record<string, unknown> = {}
    for (const k in v as Record<string, unknown>) out[k] = deepClone((v as Record<string, unknown>)[k])
    return out as T
}

/** Read a value at a dotted path. Returns `undefined` for missing branches. */
export function getPath(obj: unknown, path: string): unknown {
    if (!path) return obj
    const parts = path.split('.')
    let cur: unknown = obj
    for (const p of parts) {
        if (cur == null || typeof cur !== 'object') return undefined
        cur = (cur as Record<string, unknown>)[p]
    }
    return cur
}

/**
 * Return a NEW object/array with `value` set at the dotted path, structurally
 * sharing untouched branches. Creates arrays for numeric segments and objects
 * otherwise, so `setPath({}, 'users.0.name', 'x')` yields `{ users: [{ name: 'x' }] }`.
 */
export function setPath<T>(obj: T, path: string, value: unknown): T {
    const parts = path.split('.')
    const root: Record<string, unknown> | unknown[] = Array.isArray(obj)
        ? [...(obj as unknown[])]
        : { ...((obj as Record<string, unknown>) ?? {}) }
    let cur: Record<string, unknown> | unknown[] = root
    for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i]
        const nextIsIndex = /^\d+$/.test(parts[i + 1])
        const child = (cur as Record<string, unknown>)[p]
        const next = Array.isArray(child)
            ? [...child]
            : child && typeof child === 'object'
                ? { ...(child as Record<string, unknown>) }
                : nextIsIndex
                    ? []
                    : {}
        ;(cur as Record<string, unknown>)[p] = next
        cur = next as Record<string, unknown> | unknown[]
    }
    ;(cur as Record<string, unknown>)[parts[parts.length - 1]] = value
    return root as T
}
