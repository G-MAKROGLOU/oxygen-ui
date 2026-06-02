// ── Scheduler date helpers ────────────────────────────────────────────────────
// Pure, dependency-free date math. The legacy calendar hand-rolled brittle loops
// (`i <= week + 1 * 7` precedence bug, hardcoded 1990–2089, `31`-day assumptions);
// these are correct, generic, and unit-tested.

export type WeekStart = 0 | 1

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const MINUTES_PER_DAY = 1440

export const toDate = (d: Date | string | number): Date => (d instanceof Date ? d : new Date(d))

export const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const addDays = (d: Date, n: number): Date => {
    const x = new Date(d)
    x.setDate(x.getDate() + n)
    return x
}

/** First day of the month `n` months from `d` (normalised to the 1st, 00:00). */
export const addMonths = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth() + n, 1)

export const sameDay = (a: Date, b: Date): boolean =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export const isToday = (d: Date): boolean => sameDay(d, new Date())

export const isSameMonth = (a: Date, b: Date): boolean =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

export const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1)
export const endOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth() + 1, 0)

export const startOfWeek = (d: Date, weekStartsOn: WeekStart): Date => {
    const x = startOfDay(d)
    const diff = (x.getDay() - weekStartsOn + 7) % 7
    return addDays(x, -diff)
}

/** A 6×7 grid (42 cells) covering the cursor's month plus leading/trailing days. */
export const buildMonthGrid = (cursor: Date, weekStartsOn: WeekStart): Date[] => {
    const start = startOfWeek(startOfMonth(cursor), weekStartsOn)
    return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/** The seven days of the cursor's week. */
export const getWeekDays = (cursor: Date, weekStartsOn: WeekStart): Date[] => {
    const start = startOfWeek(cursor, weekStartsOn)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/** Inclusive [from,to] day range for the cursor's month (used to load events). */
export const monthRange = (cursor: Date): { from: Date; to: Date } => ({
    from: startOfMonth(cursor),
    to: endOfMonth(cursor),
})

/** Inclusive [from,to] day range for the cursor's week. */
export const weekRange = (cursor: Date, weekStartsOn: WeekStart): { from: Date; to: Date } => {
    const from = startOfWeek(cursor, weekStartsOn)
    return { from, to: addDays(from, 6) }
}

export const weekdayLabels = (weekStartsOn: WeekStart): string[] =>
    Array.from({ length: 7 }, (_, i) => WEEKDAYS[(i + weekStartsOn) % 7])

export const monthYearLabel = (d: Date): string => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`

/** A compact label for a week, e.g. "Jun 1 – 7, 2026" or "Jun 29 – Jul 5, 2026". */
export const weekLabel = (cursor: Date, weekStartsOn: WeekStart): string => {
    const from = startOfWeek(cursor, weekStartsOn)
    const to = addDays(from, 6)
    const m = (d: Date) => MONTHS[d.getMonth()].slice(0, 3)
    if (from.getMonth() === to.getMonth()) {
        return `${m(from)} ${from.getDate()} – ${to.getDate()}, ${to.getFullYear()}`
    }
    const yearPart = from.getFullYear() === to.getFullYear() ? `${to.getFullYear()}` : ''
    return `${m(from)} ${from.getDate()} – ${m(to)} ${to.getDate()}${yearPart ? `, ${yearPart}` : `, ${from.getFullYear()}/${to.getFullYear()}`}`
}

/** Minutes since midnight (0–1439). */
export const minutesIntoDay = (d: Date): number => d.getHours() * 60 + d.getMinutes()

/** Two-digit `HH:00` hour label. */
export const hourLabel = (hour: number): string => `${String(hour).padStart(2, '0')}:00`

/** `H:MM AM/PM`-free 24h `HH:MM` time. */
export const timeLabel = (d: Date): string =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
