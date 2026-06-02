import React, { useState } from 'react'
import { cx } from '../../utils/cx'

export interface BreadcrumbItem {
    /** Visible label. */
    label: React.ReactNode
    /** Link target. Omit on the current (last) crumb. */
    href?: string
    /** Optional leading icon. */
    icon?: React.ReactNode
    /** Click handler (router navigation). */
    onClick?: React.MouseEventHandler
}

export interface BreadcrumbsProps {
    /** Ordered trail, root → current. The last item renders as the current page. */
    items: BreadcrumbItem[]
    /** Separator between crumbs. Default a chevron. */
    separator?: React.ReactNode
    /**
     * Collapse the middle of long trails into an expandable ellipsis once the
     * count exceeds this. The first and last crumb always stay visible. Set `0`
     * to never collapse. Default `0`.
     */
    maxItems?: number
    /** Accessible label for the nav landmark. Default `'Breadcrumb'`. */
    'aria-label'?: string
    className?: string
    style?: React.CSSProperties
}

const DefaultSeparator = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-3.5 w-3.5 text-foreground-muted">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
)

const crumbBase = 'inline-flex items-center gap-1.5 rounded px-1 -mx-1 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'

function Crumb({ item, current }: { item: BreadcrumbItem; current: boolean }) {
    const inner = (
        <>
            {item.icon && <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">{item.icon}</span>}
            <span className="truncate">{item.label}</span>
        </>
    )
    if (current) {
        return (
            <span aria-current="page" className={`${crumbBase} font-medium text-foreground max-w-[16rem]`}>
                {inner}
            </span>
        )
    }
    if (item.href || item.onClick) {
        return (
            <a href={item.href} onClick={item.onClick} className={`${crumbBase} text-foreground-secondary hover:text-foreground max-w-[12rem]`}>
                {inner}
            </a>
        )
    }
    return <span className={`${crumbBase} text-foreground-secondary max-w-[12rem]`}>{inner}</span>
}

/**
 * A breadcrumb trail. Renders a `<nav><ol>` of crumbs separated by a chevron;
 * the last crumb is the current page (`aria-current="page"`, not a link). Long
 * trails can collapse their middle into a clickable ellipsis via `maxItems`.
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Fleet', href: '/fleet' },
 *     { label: 'Aurora' },
 *   ]}
 * />
 * ```
 */
export default function Breadcrumbs({
    items,
    separator = DefaultSeparator,
    maxItems = 0,
    'aria-label': ariaLabel = 'Breadcrumb',
    className = '',
    style,
}: BreadcrumbsProps) {
    const [expanded, setExpanded] = useState(false)

    const shouldCollapse = maxItems > 0 && items.length > maxItems && !expanded
    // Keep the first crumb + the last (maxItems - 1) crumbs; ellipsis stands in
    // for everything between.
    const visible: Array<{ item: BreadcrumbItem; index: number } | 'ellipsis'> = []
    if (shouldCollapse) {
        const tailCount = Math.max(1, maxItems - 1)
        visible.push({ item: items[0], index: 0 })
        visible.push('ellipsis')
        for (let i = items.length - tailCount; i < items.length; i++) visible.push({ item: items[i], index: i })
    } else {
        items.forEach((item, index) => visible.push({ item, index }))
    }

    return (
        <nav aria-label={ariaLabel} className={cx('min-w-0', className)} style={style}>
            <ol className="flex items-center gap-1.5 flex-nowrap min-w-0">
                {visible.map((entry, i) => {
                    const isLast = i === visible.length - 1
                    return (
                        <li key={entry === 'ellipsis' ? 'ellipsis' : entry.index} className="flex items-center gap-1.5 min-w-0">
                            {entry === 'ellipsis' ? (
                                <button
                                    type="button"
                                    onClick={() => setExpanded(true)}
                                    aria-label="Show hidden breadcrumbs"
                                    className="inline-flex h-6 items-center rounded px-1.5 text-sm text-foreground-secondary hover:bg-surface-raised hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    …
                                </button>
                            ) : (
                                <Crumb item={entry.item} current={entry.index === items.length - 1} />
                            )}
                            {!isLast && <span className="flex-shrink-0">{separator}</span>}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
