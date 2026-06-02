import { useCallback, useEffect, useState } from 'react'

type SetValue<T> = (value: T | ((prev: T) => T)) => void

const CUSTOM_EVENT = 'oxy-local-storage'

/**
 * Persist React state to `localStorage`, JSON-serialised. SSR-safe (falls back
 * to `initialValue` when `window` is absent), and synced both **across tabs**
 * (the native `storage` event) and **across hook instances in the same tab**
 * (a custom event), so two components on the same key stay consistent.
 *
 * @returns `[value, setValue, remove]` — `setValue` accepts a value or an
 * updater, like `useState`; `remove` deletes the key and resets to initial.
 *
 * @example
 * const [theme, setTheme, clearTheme] = useLocalStorage('theme', 'system')
 * setTheme('dark')
 * setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>, () => void] {
    const read = useCallback((): T => {
        if (typeof window === 'undefined') return initialValue
        try {
            const item = window.localStorage.getItem(key)
            return item != null ? (JSON.parse(item) as T) : initialValue
        } catch {
            return initialValue
        }
        // initialValue is intentionally excluded — it's a seed, read once per key.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    const [stored, setStored] = useState<T>(read)

    const setValue = useCallback<SetValue<T>>((value) => {
        setStored((prev) => {
            const next = value instanceof Function ? value(prev) : value
            try {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(next))
                    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: key }))
                }
            } catch {
                /* quota / serialisation errors are non-fatal */
            }
            return next
        })
    }, [key])

    const remove = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key)
                window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: key }))
            }
        } catch {
            /* ignore */
        }
        setStored(initialValue)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    // Re-read when the key changes.
    useEffect(() => { setStored(read()) }, [key, read])

    // Stay in sync with other tabs (storage) and other instances (custom event).
    useEffect(() => {
        if (typeof window === 'undefined') return
        const onStorage = (e: StorageEvent) => { if (e.key === null || e.key === key) setStored(read()) }
        const onCustom = (e: Event) => { if ((e as CustomEvent).detail === key) setStored(read()) }
        window.addEventListener('storage', onStorage)
        window.addEventListener(CUSTOM_EVENT, onCustom)
        return () => {
            window.removeEventListener('storage', onStorage)
            window.removeEventListener(CUSTOM_EVENT, onCustom)
        }
    }, [key, read])

    return [stored, setValue, remove]
}
