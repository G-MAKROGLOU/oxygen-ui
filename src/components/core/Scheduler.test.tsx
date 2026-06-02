import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Scheduler, { type SchedulerEvent } from './Scheduler'

const monthEvents: SchedulerEvent[] = [
    { id: 1, title: 'Kickoff', start: new Date(2026, 5, 10, 9, 0), end: new Date(2026, 5, 10, 10, 0) },
    { id: 2, title: 'Review', start: new Date(2026, 5, 10, 14, 0), end: new Date(2026, 5, 10, 15, 0) },
]

describe('Scheduler', () => {
    it('renders the month view with weekday headers and the title', () => {
        render(<Scheduler events={monthEvents} defaultDate={new Date(2026, 5, 15)} />)
        expect(screen.getByText('June 2026')).toBeInTheDocument()
        expect(screen.getByText('Sun')).toBeInTheDocument()
        expect(screen.getByText('Sat')).toBeInTheDocument()
        expect(screen.getByText('Kickoff')).toBeInTheDocument()
    })

    it('pages to the next month when Next is clicked', () => {
        render(<Scheduler events={[]} defaultDate={new Date(2026, 5, 15)} />)
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        expect(screen.getByText('July 2026')).toBeInTheDocument()
    })

    it('switches to the week view', () => {
        render(<Scheduler events={monthEvents} defaultDate={new Date(2026, 5, 10)} />)
        fireEvent.click(screen.getByText('Week'))
        // week label uses an en-dash range, not "June 2026"
        expect(screen.queryByText('June 2026')).toBeNull()
        expect(screen.getByText(/Jun/)).toBeInTheDocument()
    })

    it('fires onSelectEvent when an event chip is clicked', () => {
        const onSelectEvent = vi.fn()
        render(<Scheduler events={monthEvents} defaultDate={new Date(2026, 5, 15)} onSelectEvent={onSelectEvent} />)
        fireEvent.click(screen.getByText('Kickoff'))
        expect(onSelectEvent).toHaveBeenCalledTimes(1)
        expect(onSelectEvent).toHaveBeenCalledWith(expect.objectContaining({ title: 'Kickoff' }))
    })

    it('jumps to a month and year via the picker', () => {
        render(<Scheduler events={[]} defaultDate={new Date(2026, 5, 15)} />)
        // open the picker from the title
        fireEvent.click(screen.getByText('June 2026'))
        // step back a year, then pick March
        fireEvent.click(screen.getByRole('button', { name: 'Previous year' }))
        fireEvent.click(screen.getByText('Mar'))
        expect(screen.getByText('March 2025')).toBeInTheDocument()
    })

    it('shows a skeleton on first load, then the events', async () => {
        let resolve!: (e: SchedulerEvent[]) => void
        const loadEvents = vi.fn(() => new Promise<SchedulerEvent[]>((r) => { resolve = r }))
        const { container } = render(<Scheduler loadEvents={loadEvents} defaultDate={new Date(2026, 5, 15)} />)
        expect(container.querySelector('.animate-pulse')).not.toBeNull() // skeleton while pending
        resolve([{ id: 1, title: 'Loaded', start: new Date(2026, 5, 10, 9, 0) }])
        expect(await screen.findByText('Loaded')).toBeInTheDocument()
    })

    it('surfaces a load error with a retry that refetches', async () => {
        let attempt = 0
        const loadEvents = vi.fn(async () => {
            attempt += 1
            if (attempt === 1) throw new Error('boom')
            return [{ id: 1, title: 'Recovered', start: new Date(2026, 5, 10, 9, 0) }]
        })
        render(<Scheduler loadEvents={loadEvents} defaultDate={new Date(2026, 5, 15)} />)
        expect(await screen.findByText(/load events/i)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
        expect(await screen.findByText('Recovered')).toBeInTheDocument()
    })

    it('calls onError when the loader rejects', async () => {
        const onError = vi.fn()
        const loadEvents = vi.fn(async () => { throw new Error('boom') })
        render(<Scheduler loadEvents={loadEvents} onError={onError} defaultDate={new Date(2026, 5, 15)} />)
        await waitFor(() => expect(onError).toHaveBeenCalled())
    })

    it('shows the New event button only when onNewEvent is given', () => {
        const { rerender } = render(<Scheduler events={[]} defaultDate={new Date(2026, 5, 15)} />)
        expect(screen.queryByRole('button', { name: /New event/ })).toBeNull()
        rerender(<Scheduler events={[]} defaultDate={new Date(2026, 5, 15)} onNewEvent={() => {}} />)
        expect(screen.getByRole('button', { name: /New event/ })).toBeInTheDocument()
    })
})
