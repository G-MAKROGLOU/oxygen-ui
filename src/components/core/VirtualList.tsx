import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import SearchInput from '../inputs/SearchInput'
import { cx } from '../../utils/cx'

export interface VirtualListProps<T> {
    /** The full dataset, only the visible window is mounted. */
    items: T[]
    /** Fixed row height in px. (Variable heights aren't supported in this lean build.) */
    rowHeight: number
    /** Render one item. Wrapped in a row of exactly `rowHeight`. */
    renderItem: (item: T, index: number) => React.ReactNode
    /** Viewport height, number (px) or any CSS length. Default `400`. */
    height?: number | string
    /** Stable key per item. Defaults to the index. */
    getKey?: (item: T, index: number) => React.Key
    /** Extra rows rendered above/below the viewport to smooth fast scrolls. Default `6`. */
    overscan?: number
    /** Show a search field that filters the list. */
    searchable?: boolean
    /** Object keys to search (default: searches `String(item)`). */
    searchKeys?: (keyof T)[]
    /** Custom matcher, overrides `searchKeys`. */
    filter?: (item: T, term: string) => boolean
    searchPlaceholder?: string
    /** Shown when there are no items (or none match the search). */
    emptyState?: React.ReactNode
    'aria-label'?: string
    className?: string
    style?: React.CSSProperties
}

// useLayoutEffect on the client, useEffect on the server (avoids SSR warning).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * A windowed (virtualized) list: renders only the rows in view (plus overscan),
 * so 100k items scroll as cheaply as 20. Fixed `rowHeight`, no dependencies.
 * Set `searchable` for a built-in filter, the canonical "virtualized search".
 *
 * @example
 * <VirtualList
 *   items={vessels}
 *   rowHeight={56}
 *   height={420}
 *   searchable
 *   searchKeys={['name', 'imo']}
 *   getKey={(v) => v.id}
 *   renderItem={(v) => <div className="px-4 py-2">{v.name}</div>}
 * />
 */
export default function VirtualList<T>({
    items,
    rowHeight,
    renderItem,
    height = 400,
    getKey,
    overscan = 6,
    searchable = false,
    searchKeys,
    filter,
    searchPlaceholder = 'Search…',
    emptyState = 'No results',
    'aria-label': ariaLabel = 'List',
    className = '',
    style,
}: VirtualListProps<T>) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = useState(0)
    const [viewport, setViewport] = useState(typeof height === 'number' ? height : 400)
    const [term, setTerm] = useState('')

    // Measure the real viewport height (handles `height` as a %/vh string too).
    useIsoLayoutEffect(() => {
        const el = scrollRef.current
        if (!el) return
        const measure = () => setViewport(el.clientHeight)
        measure()
        if (typeof ResizeObserver === 'undefined') return
        const ro = new ResizeObserver(measure)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const filtered = useMemo(() => {
        if (!searchable || !term) return items
        if (filter) return items.filter((it) => filter(it, term))
        const needle = term.toLowerCase()
        return items.filter((it) => {
            if (searchKeys) return searchKeys.some((k) => String((it as Record<string, unknown>)[k as string] ?? '').toLowerCase().includes(needle))
            return String(it).toLowerCase().includes(needle)
        })
    }, [items, searchable, term, filter, searchKeys])

    const total = filtered.length * rowHeight
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const endIndex = Math.min(filtered.length, Math.ceil((scrollTop + viewport) / rowHeight) + overscan)
    const offsetY = startIndex * rowHeight
    const visible = filtered.slice(startIndex, endIndex)

    const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTerm(e.target.value)
        setScrollTop(0)
        if (scrollRef.current) scrollRef.current.scrollTop = 0
    }

    return (
        <div className={cx('flex w-full flex-col gap-2', className)} style={style}>
            {searchable && (
                <SearchInput value={term} onChange={onSearch} placeholder={searchPlaceholder} />
            )}
            <div
                ref={scrollRef}
                onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
                role="list"
                aria-label={ariaLabel}
                className="relative overflow-y-auto rounded-lg border border-border bg-surface"
                style={{ height }}
            >
                {filtered.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-6 text-sm text-foreground-muted">{emptyState}</div>
                ) : (
                    <div style={{ height: total, position: 'relative' }}>
                        <div style={{ transform: `translateY(${offsetY}px)` }}>
                            {visible.map((item, i) => {
                                const index = startIndex + i
                                return (
                                    <div
                                        key={getKey ? getKey(item, index) : index}
                                        role="listitem"
                                        style={{ height: rowHeight }}
                                        className="box-border"
                                    >
                                        {renderItem(item, index)}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
