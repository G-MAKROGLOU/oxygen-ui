import { describe, it, expect } from 'vitest'
import {
    buildMonthGrid,
    getWeekDays,
    startOfWeek,
    monthRange,
    weekRange,
    weekdayLabels,
    monthYearLabel,
    addMonths,
    addDays,
    sameDay,
    minutesIntoDay,
} from './scheduler.utils'

describe('scheduler.utils', () => {
    it('buildMonthGrid returns 42 days starting on the week boundary', () => {
        // June 2026: June 1 is a Monday. Week starting Sunday → grid starts May 31.
        const grid = buildMonthGrid(new Date(2026, 5, 15), 0)
        expect(grid).toHaveLength(42)
        expect(grid[0].getDay()).toBe(0) // Sunday
        expect(sameDay(grid[0], new Date(2026, 4, 31))).toBe(true)
        expect(sameDay(grid[41], addDays(grid[0], 41))).toBe(true)
    })

    it('buildMonthGrid respects weekStartsOn=1 (Monday)', () => {
        const grid = buildMonthGrid(new Date(2026, 5, 15), 1)
        expect(grid[0].getDay()).toBe(1) // Monday
    })

    it('getWeekDays returns 7 consecutive days from the week start', () => {
        const week = getWeekDays(new Date(2026, 5, 3), 0) // Wed Jun 3 2026
        expect(week).toHaveLength(7)
        expect(week[0].getDay()).toBe(0)
        expect(week[6].getDay()).toBe(6)
        expect(sameDay(week[6], addDays(week[0], 6))).toBe(true)
    })

    it('startOfWeek snaps back to the configured first day', () => {
        const d = new Date(2026, 5, 3) // Wednesday
        expect(startOfWeek(d, 0).getDay()).toBe(0)
        expect(startOfWeek(d, 1).getDay()).toBe(1)
    })

    it('monthRange spans the first to the last day of the month', () => {
        const { from, to } = monthRange(new Date(2026, 1, 10)) // Feb 2026 (28 days)
        expect(from.getDate()).toBe(1)
        expect(to.getDate()).toBe(28)
        expect(to.getMonth()).toBe(1)
    })

    it('weekRange spans 7 days', () => {
        const { from, to } = weekRange(new Date(2026, 5, 3), 0)
        expect(sameDay(to, addDays(from, 6))).toBe(true)
    })

    it('addMonths handles year rollover and normalises to the 1st', () => {
        const r = addMonths(new Date(2026, 11, 20), 1) // Dec 2026 → Jan 2027
        expect(r.getFullYear()).toBe(2027)
        expect(r.getMonth()).toBe(0)
        expect(r.getDate()).toBe(1)
    })

    it('weekdayLabels rotate with weekStartsOn', () => {
        expect(weekdayLabels(0)[0]).toBe('Sun')
        expect(weekdayLabels(1)[0]).toBe('Mon')
        expect(weekdayLabels(1)[6]).toBe('Sun')
    })

    it('monthYearLabel formats deterministically', () => {
        expect(monthYearLabel(new Date(2026, 5, 1))).toBe('June 2026')
    })

    it('minutesIntoDay computes minutes since midnight', () => {
        expect(minutesIntoDay(new Date(2026, 5, 1, 9, 30))).toBe(570)
        expect(minutesIntoDay(new Date(2026, 5, 1, 0, 0))).toBe(0)
    })
})
