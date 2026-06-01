import React, { useMemo, useState } from 'react'

export interface CalendarEvent {
    /** The day this event lands on (time ignored). */
    date: Date
    /** Optional dot colour (any CSS colour). Defaults to the accent token. */
    color?: string
    /** Optional label (used as the dot's title tooltip). */
    label?: string
}

export interface CalendarProps {
    /** Selected day. */
    value?: Date | null
    /** Fires with the clicked day. */
    onChange?: (date: Date) => void
    /** Controlled visible month (any day within it). */
    month?: Date
    /** Uncontrolled initial visible month. */
    defaultMonth?: Date
    /** Fires when the user pages months. */
    onMonthChange?: (month: Date) => void
    /** Event markers — rendered as up to three dots beneath the day. */
    events?: CalendarEvent[]
    /** Earliest / latest selectable day. */
    min?: Date
    max?: Date
    /** First column: 0 Sunday (default), 1 Monday. */
    weekStartsOn?: 0 | 1
    className?: string
    style?: React.CSSProperties
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)

function buildGrid(month: Date, weekStartsOn: 0 | 1): Date[] {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const offset = (first.getDay() - weekStartsOn + 7) % 7
    const start = new Date(first)
    start.setDate(first.getDate() - offset)
    return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        return d
    })
}

const NavIcon = ({ dir }: { dir: 'left' | 'right' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
)

/**
 * A month-grid calendar — dependency-free date math, optional event dots, and
 * `min`/`max` bounds. Display + single-day selection; pair with your own state
 * for the value. For a popover date *field*, use **Temporal** (DatePicker).
 *
 * @example
 * ```tsx
 * const [day, setDay] = useState<Date | null>(null)
 * <Calendar value={day} onChange={setDay} events={[{ date: new Date(), label: 'Today' }]} />
 * ```
 */
export default function Calendar({
    value,
    onChange,
    month,
    defaultMonth,
    onMonthChange,
    events,
    min,
    max,
    weekStartsOn = 0,
    className = '',
    style,
}: CalendarProps) {
    const today = useMemo(() => startOfDay(new Date()), [])
    const [internalMonth, setInternalMonth] = useState<Date>(() => month ?? defaultMonth ?? value ?? today)
    const visible = month ?? internalMonth

    const setMonth = (next: Date) => {
        onMonthChange?.(next)
        if (month === undefined) setInternalMonth(next)
    }

    const grid = useMemo(() => buildGrid(visible, weekStartsOn), [visible, weekStartsOn])
    const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => WEEKDAYS[(i + weekStartsOn) % 7]), [weekStartsOn])

    const eventsByDay = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>()
        for (const ev of events ?? []) {
            const key = startOfDay(ev.date).toDateString()
            const arr = map.get(key) ?? []
            arr.push(ev)
            map.set(key, arr)
        }
        return map
    }, [events])

    const disabled = (d: Date) => (min && d < startOfDay(min)) || (max && d > startOfDay(max))

    return (
        <div className={['inline-block rounded-lg border border-border bg-surface p-3 select-none', className].filter(Boolean).join(' ')} style={style}>
            {/* Header */}
            <div className="mb-2 flex items-center justify-between px-1">
                <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setMonth(addMonths(visible, -1))}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-secondary hover:bg-surface-raised hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                    <NavIcon dir="left" />
                </button>
                <div className="text-sm font-semibold text-foreground" aria-live="polite">
                    {MONTHS[visible.getMonth()]} {visible.getFullYear()}
                </div>
                <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setMonth(addMonths(visible, 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-secondary hover:bg-surface-raised hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                    <NavIcon dir="right" />
                </button>
            </div>

            {/* Weekday row */}
            <div className="grid grid-cols-7 mb-1">
                {weekdays.map((w) => (
                    <div key={w} className="text-center text-[11px] font-medium uppercase tracking-wide text-foreground-muted py-1">
                        {w}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0.5" role="grid">
                {grid.map((d, i) => {
                    const inMonth = d.getMonth() === visible.getMonth()
                    const isSelected = value != null && sameDay(d, value)
                    const isToday = sameDay(d, today)
                    const isDisabled = disabled(d)
                    const dayEvents = eventsByDay.get(d.toDateString()) ?? []
                    return (
                        <button
                            key={i}
                            type="button"
                            role="gridcell"
                            aria-selected={isSelected}
                            aria-current={isToday ? 'date' : undefined}
                            disabled={isDisabled}
                            onClick={() => onChange?.(startOfDay(d))}
                            className={[
                                'relative flex h-9 w-9 flex-col items-center justify-center rounded-md text-sm transition-colors',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                                isSelected
                                    ? 'bg-accent text-accent-fg font-semibold'
                                    : inMonth
                                        ? 'text-foreground hover:bg-surface-raised'
                                        : 'text-foreground-muted hover:bg-surface-raised',
                                isDisabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : '',
                                !isSelected && isToday ? 'ring-1 ring-inset ring-accent/60' : '',
                            ].filter(Boolean).join(' ')}
                        >
                            <span className="leading-none">{d.getDate()}</span>
                            {dayEvents.length > 0 && (
                                <span className="absolute bottom-1 flex gap-0.5">
                                    {dayEvents.slice(0, 3).map((ev, j) => (
                                        <span
                                            key={j}
                                            title={ev.label}
                                            className="h-1 w-1 rounded-full"
                                            style={{ backgroundColor: ev.color ?? (isSelected ? 'var(--color-accent-fg)' : 'var(--color-accent)') }}
                                        />
                                    ))}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
