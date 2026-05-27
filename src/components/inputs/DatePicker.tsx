import React, { useEffect, useMemo, useRef, useState } from 'react'
import Button from './Button'
import COLORS from '../../utils/colors'

/** ─────────────────── helpers ─────────────────── */
const MONTHS: Record<number, string> = {
    1: 'January', 2: 'February', 3: 'March', 4: 'April',
    5: 'May', 6: 'June', 7: 'July', 8: 'August',
    9: 'September', 10: 'October', 11: 'November', 12: 'December',
}
const DAYS: Record<number, string> = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' }

function formatDate(date: Date): string {
    const fmt = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric' })
    const parts = fmt.formatToParts(date)
    const d = parts.find((x) => x.type === 'day')!.value
    const m = parts.find((x) => x.type === 'month')!.value
    const y = parts.find((x) => x.type === 'year')!.value
    return `${y}-${m}-${d}`
}

function getMonthDays(year: number, month: number): Date[] {
    const days: Date[] = []
    for (let i = 1; i <= 31; i++) {
        const d = new Date(year, month - 1, i)
        if (d.getMonth() + 1 > month) break
        days.push(d)
    }
    return days
}

const ChevronRight = ({ color = COLORS.PALETTE['prussian-blue'] }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
)

const DoubleChevronRight = ({ color = COLORS.PALETTE['prussian-blue'] }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
)

const ChevronDown = ({ color = COLORS.PALETTE['prussian-blue'] }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
)

/** ─────────────────── DatePicker ─────────────────── */
export interface DatePickerProps {
    value: Date
    onChange: (e: { target: { value: Date; id?: string; name?: string } }) => void
    layout?: 'horizontal' | 'vertical'
    label?: React.ReactNode
    htmlFor?: string
    name?: string
    style?: React.CSSProperties
    errorMessage?: React.ReactNode
    disableBefore?: Date | string
    disableAfter?: Date | string
    disabled?: boolean
}

/**
 * Custom calendar date picker.
 *
 * @example
 * <DatePicker.DatePicker
 *   label="Report date"
 *   value={form.date}
 *   onChange={({ target }) => setField('date', target.value)}
 *   disableAfter={new Date()}
 * />
 */
function DatePickerBase({
    value,
    onChange,
    layout,
    label,
    htmlFor,
    name,
    style = {},
    errorMessage,
    disableBefore,
    disableAfter,
    disabled,
}: DatePickerProps) {
    const pickerRef = useRef<HTMLDivElement>(null)
    const calendarRef = useRef<HTMLDivElement>(null)
    const [isExpanded, setExpanded] = useState(false)
    const [isCloseToBottom, setCloseToBottom] = useState(false)
    const [currentYear, setCurrentYear] = useState(value.getFullYear())
    const [currentMonth, setCurrentMonth] = useState(value.getMonth() + 1)

    const toggle = () => { if (!disabled) setExpanded((p) => !p) }

    const toNextMonth = () => {
        if (currentMonth + 1 > 12) { setCurrentMonth(1); setCurrentYear((y) => y + 1) }
        else setCurrentMonth((m) => m + 1)
    }
    const toPrevMonth = () => {
        if (currentMonth - 1 === 0) { setCurrentMonth(12); setCurrentYear((y) => y - 1) }
        else setCurrentMonth((m) => m - 1)
    }

    const isToday = (d: Date) => {
        const t = new Date()
        return t.getDate() === d.getDate() && t.getMonth() === d.getMonth() && t.getFullYear() === d.getFullYear()
    }
    const isSelected = (d: Date) =>
        value.getDate() === d.getDate() && value.getMonth() === d.getMonth() && value.getFullYear() === d.getFullYear()

    const isDateDisabled = (d: Date) => {
        if (disableBefore && d.getTime() < new Date(disableBefore).getTime()) return true
        if (disableAfter && d.getTime() > new Date(disableAfter).getTime()) return true
        return false
    }

    const onDateClick = (d: Date) => {
        const next = new Date(formatDate(d))
        onChange({ target: { value: next, id: htmlFor, name } })
        setExpanded(false)
        setCurrentYear(d.getFullYear())
        setCurrentMonth(d.getMonth() + 1)
    }

    const renderCalendar = () => {
        const days = getMonthDays(currentYear, currentMonth)
        const firstDay = days[0].getDay()
        const cols: Date[][] = [[], [], [], [], [], [], []]
        days.forEach((d) => cols[d.getDay()].push(d))
        let ordered = [...cols]
        if (firstDay > 0) {
            ordered = [...ordered.splice(firstDay), ...ordered]
        }
        return ordered
    }

    useEffect(() => {
        const clickAway = (e: MouseEvent) => {
            if (
                pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
                calendarRef.current && !calendarRef.current.contains(e.target as Node)
            ) setExpanded(false)
        }
        document.addEventListener('mousedown', clickAway)
        return () => document.removeEventListener('mousedown', clickAway)
    }, [])

    useEffect(() => {
        const bbox = pickerRef.current?.getBoundingClientRect()
        if (bbox && (bbox.y > window.innerHeight - 220 || bbox.bottom > window.innerHeight - 400)) {
            setCloseToBottom(true)
        } else setCloseToBottom(false)
    }, [])

    return (
        <div className="w-full">
            <div className={`flex relative ${layout === 'vertical' ? 'flex-col' : 'flex-row items-center gap-2'}`}>
                {label && (
                    <label className="text-md font-bold ml-1 max-content text-prussian-blue dark:text-white">
                        {label}
                    </label>
                )}
                <div
                    style={style}
                    ref={pickerRef}
                    className={`flex items-center justify-between relative h-9 ${disabled ? 'bg-disabled cursor-not-allowed' : 'bg-white cursor-pointer'} rounded-lg p-2`}
                >
                    <div
                        onClick={toggle}
                        className={`h-7 focus:outline-none text-prussian-blue ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${!style.width ? 'min-w-[240px]' : ''} flex items-center gap-1`}
                    >
                        {formatDate(value)}
                    </div>
                    <div
                        onClick={toggle}
                        className={`transition-all duration-300 ml-2 ${isExpanded ? 'rotate-180' : 'rotate-0 w-4 h-4'}`}
                    >
                        <ChevronDown />
                    </div>
                </div>

                <div
                    ref={calendarRef}
                    className={`w-[280px] bg-ice absolute ${isCloseToBottom ? 'bottom-[40px]' : 'top-[60px]'} z-10 rounded-lg shadow-md transition-all duration-150 ${isExpanded ? 'h-max scale-100' : 'scale-0 pointer-events-none'}`}
                >
                    {isExpanded && (
                        <div className="pt-3">
                            {/* Month/year navigation */}
                            <div className="flex items-center mx-auto w-max">
                                <span onClick={() => setCurrentYear((y) => y - 1)} className="cursor-pointer rotate-180 p-1 rounded-lg hover:bg-ice-dark transition-all duration-300">
                                    <DoubleChevronRight />
                                </span>
                                <span onClick={toPrevMonth} className="cursor-pointer rotate-180 p-1 rounded-lg hover:bg-ice-dark transition-all duration-300">
                                    <ChevronRight />
                                </span>
                                <span className="font-bold text-prussian-blue select-none w-[130px] text-center">
                                    {currentYear} {MONTHS[currentMonth]}
                                </span>
                                <span onClick={toNextMonth} className="cursor-pointer p-1 rounded-lg hover:bg-ice-dark transition-all duration-300">
                                    <ChevronRight />
                                </span>
                                <span onClick={() => setCurrentYear((y) => y + 1)} className="cursor-pointer p-1 rounded-lg hover:bg-ice-dark transition-all duration-300">
                                    <DoubleChevronRight />
                                </span>
                            </div>

                            {/* Calendar grid */}
                            <div className="flex gap-3 p-2">
                                {renderCalendar().map((weekDay, index) => (
                                    <div key={index} className="flex flex-col items-center gap-2">
                                        <div className="text-center font-bold text-sm text-prussian-blue">
                                            {weekDay[0] ? DAYS[weekDay[0].getDay()] : ''}
                                        </div>
                                        {weekDay.map((day) => (
                                            <div
                                                key={day.getDate()}
                                                onClick={() => !isDateDisabled(day) && onDateClick(day)}
                                                className={`cursor-pointer flex items-center justify-center text-prussian-blue rounded-md w-6 h-6 transition-all duration-300
                                                    ${isToday(day) ? 'border border-prussian-blue' : ''}
                                                    ${isSelected(day) ? 'bg-prussian-blue text-white' : ''}
                                                    ${!isSelected(day) ? 'hover:bg-ice-dark' : ''}
                                                    ${isDateDisabled(day) ? 'bg-ice-dark text-roman-silver cursor-not-allowed pointer-events-none' : ''}`}
                                            >
                                                {day.getDate()}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Today shortcut */}
                            <div className="pb-2 pr-2 flex items-center justify-end">
                                <Button
                                    onClick={() => onDateClick(new Date())}
                                    content="Today"
                                    style={{ width: 'max-content', padding: '0px 5px', margin: '0' }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="text-center text-error dark:text-prussian-blue min-h-0">{errorMessage}</div>
        </div>
    )
}

/** ─────────────────── TemporalPicker (year/number scroll) ─────────────────── */
export interface TemporalPickerProps {
    value: number
    onChange: (e: { target: { value: number } }) => void
    type?: 'year'
    upperLimit?: number
    lowerLimit?: number
    errorMessage?: React.ReactNode
    label?: React.ReactNode
    layout?: string
    style?: React.CSSProperties
}

function TemporalPickerBase({
    value,
    onChange,
    lowerLimit = 2000,
    upperLimit = new Date().getFullYear(),
    errorMessage,
    label,
    layout,
    style = {},
}: TemporalPickerProps) {
    const pickerRef = useRef<HTMLDivElement>(null)
    const calendarRef = useRef<HTMLDivElement>(null)
    const valueRefs = useRef<{ value: number; ref: HTMLDivElement }[]>([])
    const [isExpanded, setExpanded] = useState(false)
    const [isCloseToBottom, setCloseToBottom] = useState(false)

    const innerValues = useMemo(() => {
        const vals: number[] = []
        for (let i = lowerLimit; i <= upperLimit; i++) vals.push(i)
        return vals
    }, [lowerLimit, upperLimit])

    useEffect(() => {
        const clickAway = (e: MouseEvent) => {
            if (
                pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
                calendarRef.current && !calendarRef.current.contains(e.target as Node)
            ) setExpanded(false)
        }
        document.addEventListener('mousedown', clickAway)
        return () => document.removeEventListener('mousedown', clickAway)
    }, [])

    useEffect(() => {
        const bbox = pickerRef.current?.getBoundingClientRect()
        if (bbox && bbox.y > window.innerHeight - 220) setCloseToBottom(true)
        else setCloseToBottom(false)
    }, [])

    useEffect(() => {
        if (!isExpanded) return
        const t = setTimeout(() => {
            const node = valueRefs.current.find((n) => n.value === value)
            node?.ref.scrollIntoView({ block: 'end', inline: 'nearest', behavior: 'smooth' })
        }, 150)
        return () => clearTimeout(t)
    }, [isExpanded, value])

    const navigate = (delta: number) => {
        const next = value + delta
        if (next < lowerLimit || next > upperLimit) return
        onChange({ target: { value: next } })
        const node = valueRefs.current.find((n) => n.value === next)
        node?.ref.scrollIntoView({ block: 'end', inline: 'nearest', behavior: 'smooth' })
    }

    return (
        <div className="mt-2">
            <div className={`flex relative ${layout === 'vertical' ? 'flex-col' : 'flex-row items-center gap-2'}`}>
                {label && <label className="text-md font-bold ml-1 max-content text-prussian-blue dark:text-white">{label}</label>}
                <div
                    style={style}
                    ref={pickerRef}
                    className="flex items-center justify-between relative h-9 bg-white rounded-lg p-2 cursor-pointer"
                >
                    <div
                        onClick={() => setExpanded((p) => !p)}
                        className={`h-7 ${!style.width ? 'min-w-[240px]' : ''} focus:outline-none text-prussian-blue cursor-pointer flex items-center gap-1`}
                    >
                        {innerValues.includes(value) ? value : 'N/A'}
                    </div>
                    <div onClick={() => setExpanded((p) => !p)} className={`transition-all duration-300 ml-2 ${isExpanded ? 'rotate-180' : 'rotate-0 w-4 h-4'}`}>
                        <ChevronDown />
                    </div>
                </div>

                <div
                    style={{ width: style.width }}
                    ref={calendarRef}
                    className={`${!style.width ? 'w-[280px]' : ''} bg-ice absolute z-10 ${isCloseToBottom ? 'bottom-[40px]' : 'top-10'} rounded-lg shadow-md transition-all duration-150 right-0 overflow-hidden ${isExpanded ? 'h-max scale-100' : 'scale-0 pointer-events-none'}`}
                >
                    <div onClick={() => navigate(-1)} className="flex items-center justify-center rotate-180 transition-all duration-300 hover:bg-ice-dark cursor-pointer rounded-br-lg rounded-bl-lg">
                        <ChevronDown />
                    </div>
                    <div className="h-8 overflow-hidden">
                        {innerValues.map((val) => (
                            <div
                                key={val}
                                ref={(ref) => {
                                    if (!valueRefs.current.find((n) => n.value === val) && ref)
                                        valueRefs.current.push({ value: val, ref })
                                }}
                                className="font-bold text-center text-lg"
                            >
                                {val}
                            </div>
                        ))}
                    </div>
                    <div onClick={() => navigate(1)} className="flex items-center justify-center transition-all hover:bg-ice-dark cursor-pointer rounded-br-lg rounded-bl-lg">
                        <ChevronDown />
                    </div>
                </div>
            </div>
            <div className="text-center text-error dark:text-prussian-blue min-h-0">{errorMessage}</div>
        </div>
    )
}

/** ─────────────────── Namespace export ─────────────────── */

/**
 * Temporal date/time picker namespace.
 *
 * @example
 * import Temporal from '@oxygenui/ui'
 *
 * <Temporal.DatePicker value={date} onChange={handleChange} label="Date" />
 * <Temporal.TemporalPicker value={year} type="year" lowerLimit={2018} upperLimit={2026} onChange={handleChange} />
 */
const Temporal = {} as {
    DatePicker: typeof DatePickerBase
    TemporalPicker: typeof TemporalPickerBase
}

Temporal.DatePicker = DatePickerBase
Temporal.TemporalPicker = TemporalPickerBase

export default Temporal
