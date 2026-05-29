import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { fieldShell, type FieldSize } from './_field'

// ── Public API ──────────────────────────────────────────────────────────────

export interface DatePickerProps {
    /** Current date. `null` / `undefined` means "no date selected". */
    value?: Date | null
    /** Fires with the next date (or `null` if cleared via the clear button). */
    onChange?: (date: Date | null) => void
    label?: React.ReactNode
    /** Text shown in the trigger when no date is selected. Default `"Select a date…"`. */
    placeholder?: string
    htmlFor?: string
    name?: string
    /** Label/trigger orientation. Defaults to `'horizontal'`. */
    layout?: 'horizontal' | 'vertical'
    disabled?: boolean
    errorMessage?: React.ReactNode
    /** Earliest selectable date. Dates before this render disabled. */
    min?: Date
    /** Latest selectable date. Dates after this render disabled. */
    max?: Date
    style?: React.CSSProperties
    /**
     * Custom formatter for the trigger display. Defaults to
     * `YYYY-MM-DD` via `toISOString().slice(0, 10)`.
     */
    format?: (date: Date) => string
    /** 0 = Sunday, 1 = Monday. Default `0`. */
    weekStartsOn?: 0 | 1
    /** Allow the user to clear the date with a button in the popover. Default `true`. */
    clearable?: boolean
    /** Size preset. Default `'md'`. */
    size?: FieldSize
}

// Legacy alias — the previous component exported `TemporalPickerProps`. Keep
// it for backwards-compat imports; same shape as DatePickerProps now.
export type TemporalPickerProps = DatePickerProps

// ── Date helpers ────────────────────────────────────────────────────────────

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function addDays(d: Date, n: number) { const c = new Date(d); c.setDate(c.getDate() + n); return c }
function addMonths(d: Date, n: number) { const c = new Date(d); c.setMonth(c.getMonth() + n); return c }
function defaultFormat(d: Date) {
    const y = d.getFullYear().toString().padStart(4, '0')
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${day}`
}

/**
 * Build the 6×7 calendar grid for `viewMonth`. Days from the previous and
 * next month are included as "outside" cells so the grid always has 42 cells
 * (six rows of seven days) — keeps the layout stable across months.
 */
function buildGrid(viewMonth: Date, weekStartsOn: 0 | 1): { date: Date; outside: boolean }[][] {
    const first = startOfMonth(viewMonth)
    const startOffset = (first.getDay() - weekStartsOn + 7) % 7
    const gridStart = addDays(first, -startOffset)
    const cells: { date: Date; outside: boolean }[] = []
    for (let i = 0; i < 42; i++) {
        const d = addDays(gridStart, i)
        cells.push({ date: d, outside: d.getMonth() !== viewMonth.getMonth() })
    }
    const rows: { date: Date; outside: boolean }[][] = []
    for (let r = 0; r < 6; r++) rows.push(cells.slice(r * 7, r * 7 + 7))
    return rows
}

// ── Component ──────────────────────────────────────────────────────────────

/**
 * Calendar date picker built on `@radix-ui/react-popover`.
 *
 * Renders the calendar as a real `<table role="grid">` with weekday `<th>`
 * headers and per-day `<td role="gridcell">` cells, so screen readers get
 * proper row/column context.
 *
 * **Keyboard model** (focus is anywhere inside the grid):
 * - `←` `→` — previous / next day
 * - `↑` `↓` — previous / next week
 * - `PageUp` / `PageDown` — previous / next month
 * - `Home` / `End` — first / last day of the current week
 * - `Enter` / `Space` — select the focused day
 * - `Esc` — close the popover
 *
 * @example Required date
 * ```tsx
 * const [date, setDate] = useState<Date | null>(null)
 * <DatePicker
 *   label="Report date"
 *   value={date}
 *   onChange={setDate}
 *   max={new Date()}
 * />
 * ```
 *
 * @example Custom format
 * ```tsx
 * <DatePicker
 *   value={date}
 *   onChange={setDate}
 *   format={(d) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(d)}
 * />
 * ```
 */
export default function DatePicker({
    value,
    onChange,
    label,
    placeholder = 'Select a date…',
    htmlFor,
    name: _name,
    layout = 'horizontal',
    disabled,
    errorMessage,
    min,
    max,
    style,
    format = defaultFormat,
    weekStartsOn = 0,
    clearable = true,
    size = 'md',
}: DatePickerProps) {
    const errorId = useId()
    const hasError = errorMessage != null

    const [open, setOpen] = useState(false)
    // The month currently shown in the calendar. Drives navigation independently
    // of the selected `value` so users can browse without changing the date.
    const [viewMonth, setViewMonth] = useState(() => startOfMonth(value ?? new Date()))
    // The keyboard-focused day in the grid.
    const [focusDate, setFocusDate] = useState<Date>(() => value ?? new Date())
    // Which picker view is showing: days grid, months grid (12 months), or
    // years grid (12-year decade). Lets the user jump from 2026 to 1991 in
    // 3 clicks (year header → previous decade × N → pick year → pick month).
    const [view, setView] = useState<'days' | 'months' | 'years'>('days')

    const gridRef = useRef<HTMLTableElement>(null)

    // Reset view + focus when the popover opens
    useEffect(() => {
        if (!open) return
        const target = value ?? new Date()
        setViewMonth(startOfMonth(target))
        setFocusDate(target)
        setView('days')
    }, [open, value])

    // After the active cell changes, move DOM focus to it so screen readers
    // and keyboard users land on the right cell.
    useEffect(() => {
        if (!open) return
        const cell = gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${defaultFormat(focusDate)}"]`)
        cell?.focus()
    }, [open, focusDate])

    const weekdays = useMemo(() => {
        const ordered = WEEKDAY_SHORT.slice(weekStartsOn).concat(WEEKDAY_SHORT.slice(0, weekStartsOn))
        return ordered
    }, [weekStartsOn])

    const grid = useMemo(() => buildGrid(viewMonth, weekStartsOn), [viewMonth, weekStartsOn])

    const isDisabled = (d: Date) => {
        if (min && d < min) return true
        if (max && d > max) return true
        return false
    }

    const selectDate = (d: Date) => {
        if (isDisabled(d)) return
        onChange?.(d)
        setOpen(false)
    }

    const onKey = (e: React.KeyboardEvent) => {
        const next = (delta: number) => {
            const nd = addDays(focusDate, delta)
            setFocusDate(nd)
            if (nd.getMonth() !== viewMonth.getMonth()) setViewMonth(startOfMonth(nd))
        }
        if (e.key === 'ArrowLeft')      { e.preventDefault(); next(-1) }
        else if (e.key === 'ArrowRight') { e.preventDefault(); next(1) }
        else if (e.key === 'ArrowUp')    { e.preventDefault(); next(-7) }
        else if (e.key === 'ArrowDown')  { e.preventDefault(); next(7) }
        else if (e.key === 'PageUp')     { e.preventDefault(); const nm = addMonths(viewMonth, -1); setViewMonth(nm); setFocusDate((d) => addMonths(d, -1)) }
        else if (e.key === 'PageDown')   { e.preventDefault(); const nm = addMonths(viewMonth, 1);  setViewMonth(nm); setFocusDate((d) => addMonths(d, 1)) }
        else if (e.key === 'Home')       {
            e.preventDefault()
            const dow = (focusDate.getDay() - weekStartsOn + 7) % 7
            setFocusDate(addDays(focusDate, -dow))
        }
        else if (e.key === 'End') {
            e.preventDefault()
            const dow = (focusDate.getDay() - weekStartsOn + 7) % 7
            setFocusDate(addDays(focusDate, 6 - dow))
        }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectDate(focusDate) }
        else if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
    }

    const displayValue = value ? format(value) : ''

    return (
        <div className="flex flex-col gap-1">
            <div className={`flex ${layout === 'vertical' ? 'flex-col gap-1' : 'flex-row items-center gap-2'}`}>
                {label && (
                    <label
                        className="text-sm font-medium ml-1 max-content select-none text-foreground"
                        htmlFor={htmlFor}
                    >
                        {label}
                    </label>
                )}

                <Popover.Root open={open && !disabled} onOpenChange={(o) => !disabled && setOpen(o)}>
                    <Popover.Trigger asChild>
                        <button
                            id={htmlFor}
                            type="button"
                            disabled={disabled}
                            style={style}
                            aria-invalid={hasError || undefined}
                            aria-describedby={hasError ? errorId : undefined}
                            aria-haspopup="dialog"
                            aria-expanded={open}
                            className={`flex items-center justify-between cursor-pointer select-none ${!style?.width ? 'min-w-[200px]' : ''} ${fieldShell({ size, hasError, disabled })}`}
                        >
                            <span className={`text-sm truncate ${displayValue ? '' : 'text-foreground-muted'}`}>
                                {displayValue || placeholder}
                            </span>
                            <CalendarIcon />
                        </button>
                    </Popover.Trigger>

                    <Popover.Portal>
                        <Popover.Content
                            align="start"
                            sideOffset={4}
                            className="bg-surface text-foreground border border-border rounded-lg shadow-md z-50 p-3 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                            onOpenAutoFocus={(e) => {
                                e.preventDefault()
                                // Focus is moved by the focusDate effect once the grid mounts
                            }}
                        >
                            {/* View-aware navigation header */}
                            <div className="flex items-center justify-between mb-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (view === 'days')        setViewMonth(addMonths(viewMonth, -1))
                                        else if (view === 'months') setViewMonth(new Date(viewMonth.getFullYear() - 1, viewMonth.getMonth(), 1))
                                        else                        setViewMonth(new Date(viewMonth.getFullYear() - 10, viewMonth.getMonth(), 1))
                                    }}
                                    aria-label={view === 'days' ? 'Previous month' : view === 'months' ? 'Previous year' : 'Previous decade'}
                                    className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
                                >
                                    <ChevronLeft />
                                </button>

                                {/* Header label — clicking promotes to the next-broader view.
                                    In `years` view it's not clickable (we're already at the top). */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (view === 'days') setView('months')
                                        else if (view === 'months') setView('years')
                                    }}
                                    disabled={view === 'years'}
                                    aria-label="Change view"
                                    className="text-sm font-semibold select-none rounded-md px-2 py-0.5 hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors disabled:cursor-default disabled:hover:bg-transparent"
                                >
                                    {view === 'days'   && `${MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`}
                                    {view === 'months' && `${viewMonth.getFullYear()}`}
                                    {view === 'years'  && (() => {
                                        const decadeStart = Math.floor(viewMonth.getFullYear() / 10) * 10
                                        return `${decadeStart} – ${decadeStart + 11}`
                                    })()}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (view === 'days')        setViewMonth(addMonths(viewMonth, 1))
                                        else if (view === 'months') setViewMonth(new Date(viewMonth.getFullYear() + 1, viewMonth.getMonth(), 1))
                                        else                        setViewMonth(new Date(viewMonth.getFullYear() + 10, viewMonth.getMonth(), 1))
                                    }}
                                    aria-label={view === 'days' ? 'Next month' : view === 'months' ? 'Next year' : 'Next decade'}
                                    className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
                                >
                                    <ChevronRight />
                                </button>
                            </div>

                            {/* MONTHS view — 4×3 grid of month buttons */}
                            {view === 'months' && (
                                <div className="grid grid-cols-3 gap-1 min-w-[224px]">
                                    {MONTH_NAMES.map((name, idx) => {
                                        const isCurrent = value && value.getFullYear() === viewMonth.getFullYear() && value.getMonth() === idx
                                        return (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => {
                                                    setViewMonth(new Date(viewMonth.getFullYear(), idx, 1))
                                                    setView('days')
                                                }}
                                                className={`px-2 py-2 rounded-md text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                                    isCurrent ? 'bg-accent text-accent-fg' : 'text-foreground hover:bg-surface-raised'
                                                }`}
                                            >
                                                {name.slice(0, 3)}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* YEARS view — 4×3 grid of years for the current decade
                                (plus 1 spillover slot for the year after) */}
                            {view === 'years' && (() => {
                                const decadeStart = Math.floor(viewMonth.getFullYear() / 10) * 10
                                const years = Array.from({ length: 12 }, (_, i) => decadeStart + i)
                                return (
                                    <div className="grid grid-cols-3 gap-1 min-w-[224px]">
                                        {years.map((y) => {
                                            const isCurrent = value?.getFullYear() === y
                                            return (
                                                <button
                                                    key={y}
                                                    type="button"
                                                    onClick={() => {
                                                        setViewMonth(new Date(y, viewMonth.getMonth(), 1))
                                                        setView('months')
                                                    }}
                                                    className={`px-2 py-2 rounded-md text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                                        isCurrent ? 'bg-accent text-accent-fg' : 'text-foreground hover:bg-surface-raised'
                                                    }`}
                                                >
                                                    {y}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )
                            })()}

                            {/* DAYS view — the calendar grid */}
                            {view === 'days' && (
                            <table
                                ref={gridRef}
                                role="grid"
                                aria-label={`${MONTH_NAMES[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`}
                                onKeyDown={onKey}
                                className="border-separate border-spacing-0"
                            >
                                <thead>
                                    <tr>
                                        {weekdays.map((w) => (
                                            <th key={w} scope="col" className="text-[11px] font-medium text-foreground-muted uppercase tracking-wide w-8 h-8">
                                                {w}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {grid.map((row, ri) => (
                                        <tr key={ri}>
                                            {row.map(({ date, outside }) => {
                                                const dis = isDisabled(date)
                                                const sel = value ? isSameDay(date, value) : false
                                                const focused = isSameDay(date, focusDate)
                                                const today = isSameDay(date, new Date())
                                                return (
                                                    <td key={defaultFormat(date)} role="gridcell" className="p-0">
                                                        <button
                                                            type="button"
                                                            disabled={dis}
                                                            tabIndex={focused ? 0 : -1}
                                                            data-day={defaultFormat(date)}
                                                            aria-label={defaultFormat(date)}
                                                            aria-selected={sel || undefined}
                                                            onClick={() => selectDate(date)}
                                                            className={[
                                                                'w-8 h-8 rounded-md text-xs font-medium transition-colors duration-100',
                                                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
                                                                'disabled:opacity-30 disabled:cursor-not-allowed',
                                                                sel
                                                                    ? 'bg-accent text-accent-fg'
                                                                    : today
                                                                    ? 'bg-surface-raised text-foreground ring-1 ring-inset ring-accent'
                                                                    : outside
                                                                    ? 'text-foreground-muted hover:bg-surface-raised'
                                                                    : 'text-foreground hover:bg-surface-raised',
                                                            ].join(' ')}
                                                        >
                                                            {date.getDate()}
                                                        </button>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            )}

                            {/* Footer — Today + Clear */}
                            <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
                                <button
                                    type="button"
                                    onClick={() => selectDate(new Date())}
                                    className="text-xs text-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1"
                                >
                                    Today
                                </button>
                                {clearable && value && (
                                    <button
                                        type="button"
                                        onClick={() => { onChange?.(null); setOpen(false) }}
                                        className="text-xs text-foreground-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
            </div>
            {hasError && (
                <div id={errorId} className="text-xs text-status-error ml-1">
                    {errorMessage}
                </div>
            )}
        </div>
    )
}

// Legacy named export so consumers importing `Temporal` keep working.
export const Temporal = DatePicker

// ── Inline SVGs ────────────────────────────────────────────────────────────

function CalendarIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 flex-shrink-0" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
        </svg>
    )
}

function ChevronLeft() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    )
}

function ChevronRight() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    )
}
