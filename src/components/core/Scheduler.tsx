import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import * as Popover from '@radix-ui/react-popover'
import IconButton from './IconButton'
import Button from '../inputs/Button'
import SegmentedControl from '../inputs/SegmentedControl'
import { cx } from '../../utils/cx'
import {
    type WeekStart,
    toDate,
    addDays,
    addMonths,
    isToday,
    dayKey,
    isSameMonth,
    buildMonthGrid,
    getWeekDays,
    monthRange,
    weekRange,
    weekdayLabels,
    monthYearLabel,
    weekLabel,
    minutesIntoDay,
    hourLabel,
    timeLabel,
    MONTHS_SHORT,
} from './scheduler.utils'

export type SchedulerView = 'month' | 'week'

export interface SchedulerEvent {
    id: string | number
    title: string
    /** Start time, Date or ISO string. */
    start: Date | string
    /** End time. Defaults to start + 1h. */
    end?: Date | string
    /** Any CSS colour for the event chip. Defaults to the accent token. */
    color?: string
    /** All-day event, pinned to the day header strip rather than a time slot. */
    allDay?: boolean
}

export interface SchedulerRange {
    from: Date
    to: Date
}

export interface SchedulerProps {
    /** Controlled events (supply them yourself). */
    events?: SchedulerEvent[]
    /**
     * Async loader, called whenever the visible range or view changes. The
     * Scheduler manages loading / error / empty states around it. Use this OR
     * `events`, not both.
     */
    loadEvents?: (range: SchedulerRange, view: SchedulerView) => Promise<SchedulerEvent[]>
    /** Initial view. Default `'month'`. */
    defaultView?: SchedulerView
    /** Initial focused date. Default today. */
    defaultDate?: Date
    /** First column: 0 Sunday (default), 1 Monday. */
    weekStartsOn?: WeekStart
    /** Hours shown in the week view. Default `[0, 24]` (full day). */
    dayHours?: [number, number]
    /** Pixel height of one hour row in the week view. Default `48`. */
    hourHeight?: number
    /** Click an empty day cell (month) or time slot (week), for creating events. */
    onSelectSlot?: (date: Date) => void
    /** Click an event chip. */
    onSelectEvent?: (event: SchedulerEvent) => void
    /** Click the "New event" toolbar button. Omit to hide it. */
    onNewEvent?: () => void
    /** Called when `loadEvents` rejects. The Scheduler also shows a retry state. */
    onError?: (error: unknown) => void
    className?: string
    style?: React.CSSProperties
}

// ── Event helpers (operate on normalised events) ──────────────────────────────

interface NormEvent extends Omit<SchedulerEvent, 'start' | 'end'> {
    start: Date
    end: Date
}

const normalize = (e: SchedulerEvent): NormEvent => {
    const start = toDate(e.start)
    const end = e.end ? toDate(e.end) : new Date(start.getTime() + 3_600_000)
    return { ...e, start, end }
}

const Spinner = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 animate-spin text-accent">
        <path fillRule="evenodd" clipRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" />
    </svg>
)

const Plus = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
)
const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
)

/**
 * An event scheduler with month and week views, the agenda-style calendar for
 * dashboards and ops tools (think Google Calendar's month/week). Supply events
 * directly via `events`, or hand it an async `loadEvents(range, view)` and it
 * manages the loading / empty states as the user pages around.
 *
 * For single-date selection use the {@link DatePicker} input instead.
 *
 * @example
 * <Scheduler
 *   loadEvents={async ({ from, to }) => api.events(from, to)}
 *   onSelectEvent={(e) => open(e)}
 *   onNewEvent={() => create()}
 * />
 */
export default function Scheduler({
    events: controlledEvents,
    loadEvents,
    defaultView = 'month',
    defaultDate,
    weekStartsOn = 0,
    dayHours = [0, 24],
    hourHeight = 48,
    onSelectSlot,
    onSelectEvent,
    onNewEvent,
    onError,
    className = '',
    style,
}: SchedulerProps) {
    const reduced = useReducedMotion()
    const [view, setView] = useState<SchedulerView>(defaultView)
    const [cursor, setCursor] = useState<Date>(() => defaultDate ?? new Date())
    const [loaded, setLoaded] = useState<SchedulerEvent[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)
    const [reloadKey, setReloadKey] = useState(0)
    const [dir, setDir] = useState(0) // -1 / +1 for slide direction

    // Hold the callbacks in a ref so the effect re-runs only on range/view/retry,
    // not when an inline loadEvents/onError changes identity on a parent render.
    const cbRef = useRef({ loadEvents, onError })
    cbRef.current = { loadEvents, onError }

    const range = useMemo<SchedulerRange>(
        () => (view === 'month' ? monthRange(cursor) : weekRange(cursor, weekStartsOn)),
        [view, cursor, weekStartsOn],
    )

    // Load on range/view/retry change when a loader is provided.
    const fromKey = range.from.getTime()
    const toKey = range.to.getTime()
    useEffect(() => {
        const { loadEvents: loader, onError: onErr } = cbRef.current
        if (!loader) return
        let cancelled = false
        setLoading(true)
        setError(null)
        Promise.resolve(loader({ from: new Date(fromKey), to: new Date(toKey) }, view))
            .then((evts) => { if (!cancelled) setLoaded(evts) })
            .catch((err) => { if (!cancelled) { setError(err ?? new Error('Failed to load events')); onErr?.(err) } })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [fromKey, toKey, view, reloadKey])

    const retry = useCallback(() => setReloadKey((k) => k + 1), [])

    const events = useMemo(
        () => (controlledEvents ?? loaded).map(normalize),
        [controlledEvents, loaded],
    )

    const go = useCallback((delta: -1 | 1) => {
        setDir(delta)
        setCursor((c) => (view === 'month' ? addMonths(c, delta) : addDays(c, delta * 7)))
    }, [view])

    const goToday = useCallback(() => { setDir(0); setCursor(new Date()) }, [])

    const title = view === 'month' ? monthYearLabel(cursor) : weekLabel(cursor, weekStartsOn)
    const slide = reduced ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }

    return (
        <div
            className={cx('flex flex-col overflow-hidden rounded-xl border border-border bg-surface', className)}
            style={style}
        >
            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <IconButton type="bordered" size="sm" icon={<Chevron dir="left" />} title="Previous" onClick={() => go(-1)} />
                    <IconButton type="bordered" size="sm" icon={<Chevron dir="right" />} title="Next" onClick={() => go(1)} />
                    <Button variant="ghost" size="sm" content="Today" onClick={goToday} />
                    <MonthYearPicker
                        label={title}
                        cursor={cursor}
                        onPick={(d) => { setDir(0); setCursor(d) }}
                    />
                    {loading && <Spinner />}
                </div>
                <div className="flex items-center gap-2">
                    <SegmentedControl
                        size="sm"
                        aria-label="Calendar view"
                        value={view}
                        onChange={(v) => setView(v as SchedulerView)}
                        options={[{ value: 'month', label: 'Month' }, { value: 'week', label: 'Week' }]}
                    />
                    {onNewEvent && <Button size="sm" icon={<Plus />} content="New event" onClick={onNewEvent} />}
                </div>
            </div>

            {/* ── Body ── */}
            {/* Keyed remount + enter animation (no AnimatePresence/exit): the
                previous view unmounts immediately and the new one fades/slides
                in, robust, with no exit phase that can stall mid-transition. */}
            <div className="relative flex-1 overflow-hidden">
                {error ? (
                    <SchedulerError onRetry={retry} />
                ) : loadEvents && loading && events.length === 0 ? (
                    <SchedulerSkeleton view={view} />
                ) : (
                    <motion.div
                        key={`${view}-${range.from.getTime()}`}
                        initial={{ opacity: 0, x: reduced ? 0 : dir * 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={slide}
                        className="h-full"
                    >
                        {view === 'month' ? (
                            <MonthView
                                cursor={cursor}
                                weekStartsOn={weekStartsOn}
                                events={events}
                                onSelectSlot={onSelectSlot}
                                onSelectEvent={onSelectEvent}
                            />
                        ) : (
                            <WeekView
                                cursor={cursor}
                                weekStartsOn={weekStartsOn}
                                events={events}
                                dayHours={dayHours}
                                hourHeight={hourHeight}
                                onSelectSlot={onSelectSlot}
                                onSelectEvent={onSelectEvent}
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

// ── Loading / error states ────────────────────────────────────────────────────

/** Grid-shaped placeholder shown on the first load (before any events arrive). */
function SchedulerSkeleton({ view }: { view: SchedulerView }) {
    const bar = 'rounded bg-background animate-pulse'
    if (view === 'week') {
        return (
            <div className="flex h-full flex-col p-3" aria-hidden="true">
                <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: '3.5rem repeat(7, 1fr)' }}>
                    <span />
                    {Array.from({ length: 7 }, (_, i) => <span key={i} className={`${bar} mx-auto h-8 w-8 rounded-full`} />)}
                </div>
                <div className="flex flex-1 flex-col gap-3">
                    {Array.from({ length: 8 }, (_, i) => <span key={i} className={`${bar} h-6`} style={{ width: `${60 + ((i * 13) % 35)}%` }} />)}
                </div>
            </div>
        )
    }
    return (
        <div className="flex h-full flex-col p-3" aria-hidden="true">
            <div className="mb-3 grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => <span key={i} className={`${bar} h-2.5`} />)}
            </div>
            <div className="grid flex-1 grid-cols-7 grid-rows-5 gap-2">
                {Array.from({ length: 35 }, (_, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                        <span className={`${bar} h-5 w-5 rounded-full`} />
                        {i % 3 === 0 && <span className={`${bar} h-3`} />}
                        {i % 5 === 0 && <span className={`${bar} h-3`} style={{ width: '70%' }} />}
                    </div>
                ))}
            </div>
        </div>
    )
}

function SchedulerError({ onRetry }: { onRetry: () => void }) {
    return (
        <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full text-status-error" style={{ backgroundColor: 'color-mix(in oklab, var(--color-error) 12%, var(--color-surface))' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.94a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </svg>
            </span>
            <div>
                <div className="text-sm font-semibold text-foreground">Couldn’t load events</div>
                <div className="mt-0.5 text-xs text-foreground-muted">Something went wrong fetching this range.</div>
            </div>
            <Button size="sm" variant="secondary" content="Retry" onClick={onRetry} />
        </div>
    )
}

// ── Month / year jump picker ──────────────────────────────────────────────────

function MonthYearPicker({ label, cursor, onPick }: { label: string; cursor: Date; onPick: (d: Date) => void }) {
    const [open, setOpen] = useState(false)
    const [viewYear, setViewYear] = useState(cursor.getFullYear())
    // Re-sync the browsing year to the cursor each time the popover opens.
    useEffect(() => { if (open) setViewYear(cursor.getFullYear()) }, [open, cursor])

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    className="group ml-1 inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-lg font-semibold tracking-tight text-foreground transition-colors hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                    {label}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-4 w-4 text-foreground-muted transition-transform duration-150 group-data-[state=open]:rotate-180">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                    </svg>
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="start"
                    sideOffset={8}
                    className={[
                        'z-[400] w-64 rounded-lg border border-border bg-surface p-3 shadow-lg',
                        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    ].join(' ')}
                >
                    <div className="mb-2 flex items-center justify-between">
                        <IconButton size="sm" type="bordered" icon={<Chevron dir="left" />} title="Previous year" onClick={() => setViewYear((y) => y - 1)} />
                        <span className="text-sm font-semibold tabular-nums text-foreground">{viewYear}</span>
                        <IconButton size="sm" type="bordered" icon={<Chevron dir="right" />} title="Next year" onClick={() => setViewYear((y) => y + 1)} />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        {MONTHS_SHORT.map((m, i) => {
                            const current = i === cursor.getMonth() && viewYear === cursor.getFullYear()
                            return (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => { onPick(new Date(viewYear, i, 1)); setOpen(false) }}
                                    className={[
                                        'rounded-md px-2 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                                        current ? 'bg-accent font-semibold text-accent-fg' : 'text-foreground hover:bg-background',
                                    ].join(' ')}
                                >
                                    {m}
                                </button>
                            )
                        })}
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}

// ── Month view ────────────────────────────────────────────────────────────────

const MAX_CHIPS = 3

const NO_EVENTS: NormEvent[] = []

/** Bucket events by calendar day so views do O(1) lookups instead of scanning
 * the whole event list per cell (O(days × events) → O(events)). */
function bucketByDay(events: NormEvent[]): Map<string, NormEvent[]> {
    const map = new Map<string, NormEvent[]>()
    for (const e of events) {
        const key = dayKey(e.start)
        const bucket = map.get(key)
        if (bucket) bucket.push(e)
        else map.set(key, [e])
    }
    return map
}

function MonthView({
    cursor, weekStartsOn, events, onSelectSlot, onSelectEvent,
}: {
    cursor: Date; weekStartsOn: WeekStart; events: NormEvent[]
    onSelectSlot?: (d: Date) => void; onSelectEvent?: (e: SchedulerEvent) => void
}) {
    const grid = useMemo(() => buildMonthGrid(cursor, weekStartsOn), [cursor, weekStartsOn])
    const eventsByDay = useMemo(() => bucketByDay(events), [events])
    const labels = weekdayLabels(weekStartsOn)

    return (
        <div className="flex h-full flex-col">
            <div className="grid grid-cols-7 border-b border-border">
                {labels.map((l) => (
                    <div key={l} className="px-2 py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
                        {l}
                    </div>
                ))}
            </div>
            <div className="grid flex-1 grid-cols-7 grid-rows-6">
                {grid.map((day, i) => {
                    const inMonth = isSameMonth(day, cursor)
                    const dayEvents = eventsByDay.get(dayKey(day)) ?? NO_EVENTS
                    const today = isToday(day)
                    return (
                        <button
                            type="button"
                            key={i}
                            onClick={() => onSelectSlot?.(day)}
                            className={[
                                'group flex min-h-[5rem] flex-col gap-1 border-b border-r border-border p-1.5 text-left transition-colors',
                                '[&:nth-child(7n)]:border-r-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                                // surface===surface-raised in light mode, so hover lifts toward the
                                // cool chart-mist background instead (a visible, on-brand tint).
                                inMonth ? 'bg-surface hover:bg-background' : 'bg-background hover:bg-surface',
                            ].join(' ')}
                        >
                            <span
                                className={[
                                    'flex h-6 w-6 items-center justify-center self-start rounded-full text-xs tabular-nums',
                                    today ? 'bg-accent font-semibold text-accent-fg' : inMonth ? 'text-foreground' : 'text-foreground-muted',
                                ].join(' ')}
                            >
                                {day.getDate()}
                            </span>
                            <div className="flex flex-col gap-0.5">
                                {dayEvents.slice(0, MAX_CHIPS).map((e) => (
                                    <EventChip key={e.id} event={e} onSelect={onSelectEvent} />
                                ))}
                                {dayEvents.length > MAX_CHIPS && (
                                    <span className="px-1 text-[11px] font-medium text-foreground-muted">+{dayEvents.length - MAX_CHIPS} more</span>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

function EventChip({ event, onSelect }: { event: NormEvent; onSelect?: (e: SchedulerEvent) => void }) {
    const color = event.color ?? 'var(--color-accent)'
    return (
        <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelect?.(event) }}
            title={`${event.title} · ${timeLabel(event.start)}`}
            className="flex items-center gap-1.5 truncate rounded px-1 py-0.5 text-left text-[11px] font-medium text-foreground hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span className="truncate">{event.title}</span>
        </button>
    )
}

// ── Week view ───────────────────────────────────────────────────────────────

function WeekView({
    cursor, weekStartsOn, events, dayHours, hourHeight, onSelectSlot, onSelectEvent,
}: {
    cursor: Date; weekStartsOn: WeekStart; events: NormEvent[]
    dayHours: [number, number]; hourHeight: number
    onSelectSlot?: (d: Date) => void; onSelectEvent?: (e: SchedulerEvent) => void
}) {
    const days = useMemo(() => getWeekDays(cursor, weekStartsOn), [cursor, weekStartsOn])
    const eventsByDay = useMemo(() => bucketByDay(events), [events])
    const labels = useMemo(() => weekdayLabels(weekStartsOn), [weekStartsOn])
    const dow = (d: Date) => labels[(d.getDay() - weekStartsOn + 7) % 7]
    const [startHour, endHour] = dayHours
    const hours = useMemo(
        () => Array.from({ length: endHour - startHour }, (_, i) => startHour + i),
        [startHour, endHour],
    )
    const spanMinutes = (endHour - startHour) * 60
    const gridHeight = hours.length * hourHeight

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Day headers */}
            <div className="grid border-b border-border" style={{ gridTemplateColumns: `3.5rem repeat(7, 1fr)` }}>
                <div className="border-r border-border" />
                {days.map((d) => (
                    <div key={d.getTime()} className="border-r border-border px-1 py-1.5 text-center last:border-r-0">
                        <div className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted">{dow(d)}</div>
                        <div className={['mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums', isToday(d) ? 'bg-accent font-semibold text-accent-fg' : 'text-foreground'].join(' ')}>
                            {d.getDate()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Scrollable time grid */}
            <div className="flex-1 overflow-y-auto">
                <div className="grid" style={{ gridTemplateColumns: `3.5rem repeat(7, 1fr)`, height: gridHeight }}>
                    {/* Hour gutter */}
                    <div className="relative border-r border-border">
                        {hours.map((h, i) => (
                            <div key={h} className="absolute right-1 -translate-y-1/2 text-[10px] tabular-nums text-foreground-muted" style={{ top: i * hourHeight }}>
                                {i === 0 ? '' : hourLabel(h)}
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {days.map((day) => {
                        const dayEvents = (eventsByDay.get(dayKey(day)) ?? NO_EVENTS).filter((e) => !e.allDay)
                        return (
                            <div key={day.getTime()} className="relative border-r border-border last:border-r-0">
                                {/* hour lines + click targets */}
                                {hours.map((h, i) => (
                                    <button
                                        type="button"
                                        key={h}
                                        aria-label={`${dow(day)} ${day.getDate()} ${hourLabel(h)}`}
                                        onClick={() => onSelectSlot?.(new Date(day.getFullYear(), day.getMonth(), day.getDate(), h))}
                                        className="absolute left-0 right-0 border-b border-border hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                                        style={{ top: i * hourHeight, height: hourHeight }}
                                    />
                                ))}
                                {/* events */}
                                {dayEvents.map((e) => {
                                    const top = ((minutesIntoDay(e.start) - startHour * 60) / spanMinutes) * gridHeight
                                    const durMin = Math.max(20, (e.end.getTime() - e.start.getTime()) / 60000)
                                    const height = (durMin / spanMinutes) * gridHeight
                                    const color = e.color ?? 'var(--color-accent)'
                                    return (
                                        <button
                                            type="button"
                                            key={e.id}
                                            onClick={(ev) => { ev.stopPropagation(); onSelectEvent?.(e) }}
                                            title={`${e.title} · ${timeLabel(e.start)}–${timeLabel(e.end)}`}
                                            className="absolute left-0.5 right-0.5 overflow-hidden rounded-md border px-1.5 py-0.5 text-left text-[11px] leading-tight text-foreground shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                            style={{
                                                top: Math.max(0, top),
                                                height,
                                                backgroundColor: `color-mix(in oklab, ${color} 14%, var(--color-surface))`,
                                                borderColor: `color-mix(in oklab, ${color} 40%, var(--color-surface))`,
                                            }}
                                        >
                                            <div className="truncate font-medium">{e.title}</div>
                                            <div className="truncate" style={{ color }}>{timeLabel(e.start)}</div>
                                        </button>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
