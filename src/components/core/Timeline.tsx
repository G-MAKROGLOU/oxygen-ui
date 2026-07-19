import React from 'react'
import { cx } from '../../utils/cx'

export type TimelineStatus = 'complete' | 'current' | 'upcoming' | 'error'

export interface TimelineEvent {
    key: string | number
    /** Event title, e.g. "Out for delivery". */
    title: React.ReactNode
    /** Optional detail line. */
    description?: React.ReactNode
    /** Optional timestamp / meta, shown muted. */
    timestamp?: React.ReactNode
    /** Custom node icon (overrides the default dot / check). */
    icon?: React.ReactNode
    /** Explicit status. If omitted, derived from `current` (see Timeline). */
    status?: TimelineStatus
}

export interface TimelineProps {
    events: TimelineEvent[]
    /**
     * Index of the in-progress event. When set (and an event has no explicit
     * `status`), events before it are `complete`, the one at it is `current`,
     * and later ones are `upcoming`. Order-tracking style.
     */
    current?: number
    className?: string
}

const Check = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true" className="h-3 w-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
    </svg>
)
const Cross = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true" className="h-3 w-3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
    </svg>
)

const NODE: Record<TimelineStatus, string> = {
    complete: 'bg-accent text-accent-fg border-accent',
    current: 'bg-surface text-accent border-accent',
    upcoming: 'bg-surface text-transparent border-border',
    error: 'bg-status-error text-white border-status-error',
}

/**
 * A vertical timeline of ordered events, order tracking (Order placed →
 * Packed → Shipped → Out for delivery → Delivered), audit trails, activity
 * feeds, anything sequential. Completed events show a check on the accent rail;
 * the current event pulses; upcoming events are muted.
 *
 * Drive it either by setting each event's `status`, or by passing `current`
 * and letting the statuses derive from it.
 *
 * @example
 * <Timeline current={2} events={[
 *   { key: 1, title: 'Order placed',     timestamp: 'Mon 09:24' },
 *   { key: 2, title: 'Gathering items',  timestamp: 'Mon 11:02' },
 *   { key: 3, title: 'Out for shipping', timestamp: 'Tue 08:15' },
 *   { key: 4, title: 'Out for delivery' },
 *   { key: 5, title: 'Delivered' },
 * ]} />
 */
export default function Timeline({ events, current, className = '' }: TimelineProps) {
    const statusOf = (e: TimelineEvent, i: number): TimelineStatus => {
        if (e.status) return e.status
        if (current == null) return 'upcoming'
        return i < current ? 'complete' : i === current ? 'current' : 'upcoming'
    }

    return (
        <ol className={cx('flex flex-col', className)}>
            {events.map((event, i) => {
                const status = statusOf(event, i)
                const last = i === events.length - 1
                // The rail segment below a node is "filled" once this event is done.
                const railFilled = status === 'complete'
                return (
                    <li key={event.key} className="flex gap-3">
                        {/* Rail + node */}
                        <div className="flex flex-col items-center self-stretch">
                            <span
                                className={[
                                    'relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                    NODE[status],
                                ].join(' ')}
                            >
                                {status === 'current' && (
                                    <span className="absolute inset-0 animate-breathe rounded-full ring-2 ring-accent/40" aria-hidden="true" />
                                )}
                                {event.icon ?? (
                                    status === 'complete' ? <Check /> :
                                    status === 'error' ? <Cross /> :
                                    <span className={`h-2 w-2 rounded-full ${status === 'current' ? 'bg-accent' : 'bg-border'}`} />
                                )}
                            </span>
                            {!last && <span className={`my-1 w-0.5 flex-1 ${railFilled ? 'bg-accent' : 'bg-border'}`} />}
                        </div>

                        {/* Content */}
                        <div className={last ? 'pb-0' : 'pb-6'}>
                            <div className={`text-sm font-medium leading-tight ${status === 'upcoming' ? 'text-foreground-muted' : 'text-foreground'}`}>
                                {event.title}
                            </div>
                            {event.description && (
                                <div className="mt-0.5 text-xs leading-snug text-foreground-secondary">{event.description}</div>
                            )}
                            {event.timestamp && (
                                <div className="mt-1 text-[11px] uppercase tracking-wide text-foreground-muted">{event.timestamp}</div>
                            )}
                        </div>
                    </li>
                )
            })}
        </ol>
    )
}
