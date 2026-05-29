import React, { useEffect, useId, useRef, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import LoadingSpinner from '../core/LoadingSpinner'
import { Field, fieldShell, type FieldSize } from './_field'

export interface AutoCompleteItem {
    key: string
    value: string
    label: string
    icon?: React.ReactNode
}

export interface AutoCompleteProps {
    disabled?: boolean
    label?: React.ReactNode
    placeholder?: string
    name?: string
    inputStyle?: React.CSSProperties
    style?: React.CSSProperties
    /** Label/input orientation. Defaults to `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    /**
     * Static list — when provided, the component does its own substring
     * filtering on `label` and `key`. Mutually exclusive with `onSearch`.
     */
    items?: AutoCompleteItem[]
    /**
     * Async resolver — when provided, `items` is ignored and `onSearch(term)`
     * is called (debounced) every time the user pauses typing. Its returned
     * promise drives the option list. The component manages an internal
     * `loading` state and shows an `xs` LoadingSpinner where the search icon
     * normally lives while a query is in flight.
     */
    onSearch?: (term: string) => Promise<AutoCompleteItem[]>
    /**
     * Debounce delay (ms) before `onSearch` fires after the user stops
     * typing. Default `250`. Ignored when `items` is used.
     */
    debounce?: number
    onItemClick?: (value: string) => void
    /** Custom "empty" message */
    emptyText?: string
    /** Custom "loading" message — shown in async mode while a query is in flight. */
    loadingText?: string
    /** Size preset. Default `'md'`. */
    size?: FieldSize
    /** Override the leading search icon (hidden while loading). */
    icon?: React.ReactNode
    /** Validation message — turns the field red and links via aria-describedby. */
    errorMessage?: React.ReactNode
    /** Mark required (asterisk after the label). */
    required?: boolean
    htmlFor?: string
}

/**
 * Search-as-you-type autocomplete powered by Radix Popover. Supports two
 * modes:
 *
 * - **Static**: pass `items` — the component substring-filters locally.
 *   Best for small fixed lists (≤ 200 entries).
 * - **Async**: pass `onSearch(term) => Promise<Item[]>` — the component
 *   debounces input and drives the option list from the resolver. Shows
 *   an `xs` LoadingSpinner while the query is in flight.
 *
 * The popover opens when the input is focused and closes when an item is
 * selected or the user clicks away.
 *
 * @example Static (small fixed list)
 * ```tsx
 * <AutoComplete
 *   label="Vessel"
 *   items={vessels.map((v) => ({ key: v.imo, value: v.imo, label: v.name }))}
 *   onItemClick={(imo) => setVessel(imo)}
 * />
 * ```
 *
 * @example Async (server-backed)
 * ```tsx
 * <AutoComplete
 *   label="Port"
 *   debounce={300}
 *   onSearch={async (term) => {
 *     const res = await fetch(`/api/ports?q=${encodeURIComponent(term)}`)
 *     const data = await res.json()
 *     return data.map((p) => ({ key: p.unlocode, value: p.unlocode, label: p.name }))
 *   }}
 *   onItemClick={(unlocode) => setPort(unlocode)}
 * />
 * ```
 */
export default function AutoComplete({
    disabled,
    label,
    placeholder,
    name,
    inputStyle,
    style,
    layout = 'vertical',
    items,
    onSearch,
    debounce = 250,
    onItemClick,
    emptyText = 'No results found',
    loadingText = 'Searching…',
    size = 'md',
    icon,
    errorMessage,
    required,
    htmlFor,
}: AutoCompleteProps) {
    const errorId = useId()
    const hasError = errorMessage != null
    const [term, setTerm] = useState('')
    const [open, setOpen] = useState(false)
    const [asyncItems, setAsyncItems] = useState<AutoCompleteItem[]>([])
    const [loading, setLoading] = useState(false)

    const isAsync = typeof onSearch === 'function'
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    // Track the most recent in-flight request so out-of-order responses
    // don't overwrite fresher results.
    const requestIdRef = useRef(0)

    // Static filtering — only when not async
    const staticFiltered = isAsync || !items
        ? []
        : term.trim()
        ? items.filter(
              ({ key, label }) =>
                  label.toLowerCase().includes(term.toLowerCase()) ||
                  key.toLowerCase().includes(term.toLowerCase()),
          )
        : []

    // Async debounce + fetch
    useEffect(() => {
        if (!isAsync) return
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (!term.trim()) {
            setAsyncItems([])
            setLoading(false)
            return
        }
        const myId = ++requestIdRef.current
        setLoading(true)
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await onSearch!(term)
                if (myId === requestIdRef.current) {
                    setAsyncItems(res)
                }
            } catch {
                if (myId === requestIdRef.current) {
                    setAsyncItems([])
                }
            } finally {
                if (myId === requestIdRef.current) {
                    setLoading(false)
                }
            }
        }, debounce)
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [term, isAsync, debounce, onSearch])

    const foundItems = isAsync ? asyncItems : staticFiltered

    const handleSelect = (item: AutoCompleteItem) => {
        setTerm(`${item.label} (${item.value})`)
        onItemClick?.(item.value)
        setOpen(false)
    }

    return (
        <Field
            label={label}
            htmlFor={htmlFor}
            errorId={errorId}
            errorMessage={errorMessage}
            layout={layout}
            required={required}
        >
                <Popover.Root open={open && !disabled} onOpenChange={(o) => !disabled && setOpen(o)}>
                    <Popover.Anchor asChild>
                        <div className={`flex items-center ${fieldShell({ size, hasError, disabled, focusWithin: true })}`} style={style}>
                            <input
                                id={htmlFor}
                                disabled={disabled}
                                value={term}
                                onChange={(e) => {
                                    setTerm(e.target.value)
                                    setOpen(true)
                                }}
                                onFocus={() => setOpen(true)}
                                type="text"
                                name={name}
                                className="min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed placeholder:text-foreground-muted"
                                style={inputStyle}
                                placeholder={placeholder ?? ''}
                                autoComplete="off"
                                aria-haspopup="listbox"
                                aria-expanded={open}
                                aria-autocomplete="list"
                                aria-busy={loading || undefined}
                                aria-invalid={hasError || undefined}
                                aria-describedby={hasError ? errorId : undefined}
                            />
                            {loading ? (
                                <span className="ml-2 w-4 h-4 flex-shrink-0 flex items-center justify-center text-accent" aria-hidden="true">
                                    <LoadingSpinner inline size="xs" spinnerColor="currentColor" />
                                </span>
                            ) : (
                                <span className="ml-2 flex-shrink-0 text-foreground-muted">
                                    {icon ?? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </span>
                            )}
                        </div>
                    </Popover.Anchor>

                    <Popover.Portal>
                        <Popover.Content
                            align="start"
                            sideOffset={4}
                            onOpenAutoFocus={(e) => e.preventDefault()}
                            className="w-64 bg-surface border border-border rounded-lg mt-1 shadow-md z-50 overflow-y-auto max-h-36 animate-in fade-in-0 zoom-in-95"
                        >
                            {loading ? (
                                <div className="h-full w-full flex items-center justify-center gap-2 py-4 text-sm text-foreground-secondary">
                                    <LoadingSpinner inline size="xs" />
                                    <span>{loadingText}</span>
                                </div>
                            ) : foundItems.length === 0 ? (
                                <div className="h-full w-full flex flex-col items-center justify-center py-4 text-sm text-foreground-secondary">
                                    {emptyText}
                                </div>
                            ) : (
                                <div role="listbox">
                                    {foundItems.map((item) => (
                                        <div
                                            key={item.key}
                                            role="option"
                                            tabIndex={0}
                                            className="text-sm flex items-center gap-2 p-2 transition-colors duration-150 hover:bg-surface-raised cursor-pointer text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                            onClick={() => handleSelect(item)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    handleSelect(item)
                                                }
                                            }}
                                        >
                                            {item.icon}
                                            <span>
                                                {item.label} ({item.value})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
        </Field>
    )
}
