import React from 'react'

export interface ListItem {
    /** Stable key for React reconciliation + active-key matching. */
    key: string | number
    /** Main item text (title). Required. */
    label: React.ReactNode
    /** Optional description rendered below the label, in foreground-secondary. */
    description?: React.ReactNode
    /**
     * Optional leading slot, typically an Avatar. Anything React-renderable
     * is accepted (icon, image, status badge…).
     */
    avatar?: React.ReactNode
    /** Optional trailing slot, e.g. a badge, count, or action icon. */
    trailing?: React.ReactNode
    /** Disable interaction for this item only. */
    disabled?: boolean
}

export interface ListProps {
    items: ListItem[]
    onItemClick: (item: ListItem) => void
    activeKey?: string | number
    /**
     * Visual density. `'compact'` for dense reference lists,
     * `'comfortable'` (default) for typical UI, `'spacious'` for hero rows.
     */
    density?: 'compact' | 'comfortable' | 'spacious'
    /** Extra classes merged onto the list root. */
    className?: string
    /** Inline style on the list root. */
    style?: React.CSSProperties
}

const DENSITY_PADDING: Record<NonNullable<ListProps['density']>, string> = {
    'compact':     'py-1.5 px-2',
    'comfortable': 'py-2.5 px-3',
    'spacious':    'py-3.5 px-4',
}

/**
 * Vertical clickable list with optional avatar / description / trailing
 * slots per item. Built on `role="listbox"` + `role="option"` so screen
 * readers announce it as a selectable list. Keyboard activation works on
 * Enter and Space.
 *
 * **When to use this** over a Table:
 * - When the dataset is a simple sequence of records that the user
 *   browses + picks one of (sidebar nav, contact list, vessel chooser).
 * - When each row's primary signal is a 1–2-line summary, not a tabular
 *   breakdown.
 *
 * Use Table when comparing rows across multiple columns matters more than
 * picking one.
 *
 * @example Plain
 * ```tsx
 * <List
 *   items={[{ key: 1, label: 'Aurora' }, { key: 2, label: 'Beacon' }]}
 *   activeKey={2}
 *   onItemClick={(it) => setSelected(it.key)}
 * />
 * ```
 *
 * @example With avatars + descriptions
 * ```tsx
 * <List
 *   items={crew.map((c) => ({
 *     key: c.id,
 *     label: c.name,
 *     description: c.rank,
 *     avatar: <Avatar src={c.photo} alt={c.name} status={c.status} />,
 *     trailing: <Badge count={c.unread} />,
 *   }))}
 *   onItemClick={(it) => navigate(`/crew/${it.key}`)}
 * />
 * ```
 */
export default function List({
    items,
    onItemClick,
    activeKey,
    density = 'comfortable',
    className = '',
    style,
}: ListProps) {
    return (
        <div role="listbox" className={`flex flex-col ${className}`.trim()} style={style}>
            {items.map((item) => {
                const isActive   = activeKey === item.key
                const isDisabled = !!item.disabled
                return (
                    <div
                        key={item.key}
                        role="option"
                        aria-selected={isActive}
                        aria-disabled={isDisabled || undefined}
                        tabIndex={isDisabled ? -1 : 0}
                        onClick={() => !isDisabled && onItemClick(item)}
                        onKeyDown={(e) => {
                            if (isDisabled) return
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                onItemClick(item)
                            }
                        }}
                        className={[
                            'flex items-center gap-3 cursor-pointer border-b border-border transition-colors duration-150',
                            DENSITY_PADDING[density],
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
                            isDisabled
                                ? 'opacity-50 cursor-not-allowed'
                                : isActive
                                ? 'bg-surface-raised text-foreground'
                                : 'text-foreground-secondary hover:bg-surface-raised hover:text-foreground',
                        ].join(' ')}
                    >
                        {item.avatar && (
                            <span className="flex-shrink-0">{item.avatar}</span>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                                {item.label}
                            </div>
                            {item.description && (
                                <div className="text-xs text-foreground-secondary mt-0.5 truncate">
                                    {item.description}
                                </div>
                            )}
                        </div>
                        {item.trailing && (
                            <span className="flex-shrink-0 text-foreground-muted">{item.trailing}</span>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
