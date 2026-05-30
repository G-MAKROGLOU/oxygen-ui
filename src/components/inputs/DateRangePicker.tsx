import React, { useId, useMemo, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Field, fieldShell, type FieldSize } from './_field'

export interface DateRange {
    start: Date | null
    end: Date | null
}

export interface DateRangePreset {
    label: string
    /** Returns the range when clicked. */
    range: () => DateRange
}

export interface DateRangePickerProps {
    value?: DateRange
    onChange?: (range: DateRange) => void
    label?: React.ReactNode
    htmlFor?: string
    placeholder?: string
    layout?: 'horizontal' | 'vertical'
    size?: FieldSize
    min?: Date
    max?: Date
    /** 0 = Sunday, 1 = Monday. Default `0`. */
    weekStartsOn?: 0 | 1
    /** Quick-select presets shown in a rail beside the calendars. */
    presets?: DateRangePreset[]
    format?: (d: Date) => string
    disabled?: boolean
    errorMessage?: React.ReactNode
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    required?: boolean
    style?: React.CSSProperties
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)
const addDays = (d: Date, n: number) => { const c = new Date(d); c.setDate(c.getDate() + n); return c }
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const defaultFmt = (d: Date) => `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`

function buildGrid(viewMonth: Date, weekStartsOn: 0 | 1) {
    const first = startOfMonth(viewMonth)
    const offset = (first.getDay() - weekStartsOn + 7) % 7
    const gridStart = addDays(first, -offset)
    return Array.from({ length: 42 }, (_, i) => {
        const d = addDays(gridStart, i)
        return { date: d, outside: d.getMonth() !== viewMonth.getMonth() }
    })
}

/**
 * Two-month range date picker. Click a start date, then an end date; the span
 * between highlights as you hover. Optional quick-select presets (Today,
 * Last 7 days, This month, etc.) in a side rail.
 *
 * @example
 * ```tsx
 * <DateRangePicker
 *   label="Reporting period"
 *   value={range}
 *   onChange={setRange}
 *   presets={[
 *     { label: 'Last 7 days', range: () => ({ start: addDays(new Date(), -6), end: new Date() }) },
 *   ]}
 * />
 * ```
 */
export default function DateRangePicker({
    value = { start: null, end: null },
    onChange,
    label,
    htmlFor,
    placeholder = 'Select a date range…',
    layout = 'vertical',
    size = 'md',
    min,
    max,
    weekStartsOn = 0,
    presets,
    format = defaultFmt,
    disabled,
    errorMessage,
    helperText,
    required,
    style,
}: DateRangePickerProps) {
    const errorId = useId()
    const hasError = errorMessage != null
    const [open, setOpen] = useState(false)
    const [leftMonth, setLeftMonth] = useState(() => startOfMonth(value.start ?? new Date()))
    // While selecting, we hold the in-progress start and hover end.
    const [pendingStart, setPendingStart] = useState<Date | null>(null)
    const [hoverDate, setHoverDate] = useState<Date | null>(null)

    const weekdays = useMemo(
        () => WEEKDAY.slice(weekStartsOn).concat(WEEKDAY.slice(0, weekStartsOn)),
        [weekStartsOn],
    )

    const isDisabled = (d: Date) => (min && d < startOfDay(min)) || (max && d > startOfDay(max))

    // The range currently being visualised (committed value, or in-progress).
    const effective: DateRange = pendingStart
        ? { start: pendingStart, end: hoverDate }
        : value

    const inRange = (d: Date) => {
        const { start, end } = effective
        if (!start || !end) return false
        const [a, b] = start <= end ? [start, end] : [end, start]
        return d >= startOfDay(a) && d <= startOfDay(b)
    }

    const onDayClick = (d: Date) => {
        if (isDisabled(d)) return
        if (!pendingStart) {
            setPendingStart(d)
            setHoverDate(d)
            onChange?.({ start: d, end: null })
        } else {
            const [start, end] = pendingStart <= d ? [pendingStart, d] : [d, pendingStart]
            onChange?.({ start, end })
            setPendingStart(null)
            setHoverDate(null)
            setOpen(false)
        }
    }

    const triggerText = value.start && value.end
        ? `${format(value.start)} – ${format(value.end)}`
        : value.start
        ? `${format(value.start)} – …`
        : ''

    const renderMonth = (viewMonth: Date) => {
        const cells = buildGrid(viewMonth, weekStartsOn)
        return (
            <div>
                <div className="text-sm font-semibold text-center mb-2 select-none">
                    {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {weekdays.map((w) => (
                        <div key={w} className="text-[11px] font-medium text-foreground-muted uppercase text-center">{w}</div>
                    ))}
                    {cells.map(({ date, outside }) => {
                        const dis = isDisabled(date)
                        const isStart = effective.start && isSameDay(date, effective.start)
                        const isEnd = effective.end && isSameDay(date, effective.end)
                        const within = inRange(date) && !isStart && !isEnd
                        return (
                            <button
                                key={defaultFmt(date)}
                                type="button"
                                disabled={dis}
                                onMouseEnter={() => pendingStart && setHoverDate(date)}
                                onClick={() => onDayClick(date)}
                                className={[
                                    'h-8 text-xs font-medium transition-colors',
                                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                                    'disabled:opacity-30 disabled:cursor-not-allowed',
                                    isStart || isEnd
                                        ? 'bg-accent text-accent-fg rounded-md'
                                        : within
                                        ? 'bg-surface-raised text-foreground rounded-none'
                                        : outside
                                        ? 'text-foreground-muted hover:bg-surface-raised rounded-md'
                                        : 'text-foreground hover:bg-surface-raised rounded-md',
                                ].join(' ')}
                            >
                                {date.getDate()}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <Field label={label} htmlFor={htmlFor} errorId={errorId} errorMessage={errorMessage} helperText={helperText} layout={layout} required={required}>
            <Popover.Root open={open && !disabled} onOpenChange={(o) => { if (!disabled) { setOpen(o); if (!o) { setPendingStart(null); setHoverDate(null) } } }}>
                <Popover.Trigger asChild>
                    <button
                        id={htmlFor}
                        type="button"
                        disabled={disabled}
                        style={style}
                        aria-invalid={hasError || undefined}
                        aria-describedby={hasError ? errorId : undefined}
                        className={`flex items-center justify-between cursor-pointer select-none ${!style?.width ? 'min-w-[240px]' : ''} ${fieldShell({ size, hasError, disabled })}`}
                    >
                        <span className={`text-sm truncate ${triggerText ? '' : 'text-foreground-muted'}`}>
                            {triggerText || placeholder}
                        </span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 flex-shrink-0 text-foreground-muted ml-2" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
                        </svg>
                    </button>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content
                        align="start"
                        sideOffset={4}
                        className="bg-surface text-foreground border border-border rounded-lg shadow-md z-50 p-3 flex gap-3 animate-in fade-in-0 zoom-in-95"
                    >
                        {presets && presets.length > 0 && (
                            <div className="flex flex-col gap-1 pr-3 border-r border-border min-w-[120px]">
                                {presets.map((p) => (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => { onChange?.(p.range()); setOpen(false) }}
                                        className="text-left text-xs px-2 py-1.5 rounded-md text-foreground-secondary hover:bg-surface-raised hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-4">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setLeftMonth(addMonths(leftMonth, -1))}
                                    aria-label="Previous month"
                                    className="absolute -top-1 left-0 w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                {renderMonth(leftMonth)}
                            </div>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setLeftMonth(addMonths(leftMonth, 1))}
                                    aria-label="Next month"
                                    className="absolute -top-1 right-0 w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>
                                {renderMonth(addMonths(leftMonth, 1))}
                            </div>
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </Field>
    )
}
