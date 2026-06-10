import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { http, HttpResponse, delay } from 'msw'
import Scheduler, { type SchedulerEvent } from './Scheduler'

const COLORS = ['#0466C8', '#1e8449', '#d68910', '#c0392b', '#6c5ce7']

// A demo dataset anchored to the current month so it lands in the default view.
const DEMO_EVENTS: SchedulerEvent[] = (() => {
    const now = new Date()
    const at = (dayOffset: number, h: number, m = 0) =>
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, h, m).toISOString()
    return [
        { id: 1, title: 'Daily standup', start: at(0, 9, 30), end: at(0, 10, 0), color: COLORS[0] },
        { id: 2, title: 'Design review', start: at(0, 11, 0), end: at(0, 12, 30), color: COLORS[4] },
        { id: 3, title: 'Lunch w/ client', start: at(1, 12, 0), end: at(1, 13, 30), color: COLORS[2] },
        { id: 4, title: '1:1 with Maria', start: at(2, 15, 0), end: at(2, 15, 30), color: COLORS[1] },
        { id: 5, title: 'Release v6.2', start: at(3, 16, 0), end: at(3, 18, 0), color: COLORS[3] },
        { id: 6, title: 'Sprint retro', start: at(5, 10, 0), end: at(5, 11, 0), color: COLORS[0] },
        { id: 7, title: 'Quarterly planning', start: at(-2, 14, 0), end: at(-2, 16, 0), color: COLORS[4] },
        { id: 8, title: 'Customer demo', start: at(8, 13, 0), end: at(8, 14, 0), color: COLORS[1] },
        { id: 9, title: 'Sync', start: at(0, 14, 0), end: at(0, 14, 30), color: COLORS[2] },
        { id: 10, title: 'Interview', start: at(0, 16, 0), end: at(0, 17, 0), color: COLORS[3] },
    ]
})()

// MSW: returns the events whose start falls inside the requested range.
const handler = http.get('/api/scheduler/events', async ({ request }) => {
    const url = new URL(request.url)
    const from = new Date(url.searchParams.get('from') ?? 0).getTime()
    const to = new Date(url.searchParams.get('to') ?? 0).getTime() + 86_400_000 // inclusive of the last day
    await delay(350)
    const inRange = DEMO_EVENTS.filter((e) => {
        const t = new Date(e.start).getTime()
        return t >= from && t <= to
    })
    return HttpResponse.json(inRange)
})

const meta: Meta<typeof Scheduler> = {
    title: 'Data Display/Scheduler',
    component: Scheduler,
    parameters: { layout: 'fullscreen', msw: { handlers: [handler] } },
}
export default meta
type Story = StoryObj<typeof Scheduler>

const loadEvents = async ({ from, to }: { from: Date; to: Date }) => {
    const res = await fetch(`/api/scheduler/events?from=${from.toISOString()}&to=${to.toISOString()}`)
    return res.json()
}

const Frame = ({ children }: { children: React.ReactNode }) => (
    <div style={{ height: 660 }} className="p-4">{children}</div>
)

export const AsyncMonth: Story = {
    name: 'Month — async via MSW',
    render: () => <Frame><Scheduler loadEvents={loadEvents} onNewEvent={() => alert('New event')} onSelectEvent={(e) => alert(e.title)} /></Frame>,
    parameters: { docs: { description: { story: 'Events are fetched per visible range with `GET /api/scheduler/events` (350 ms latency, mocked by MSW). Page months and watch it refetch.' } } },
}

export const AsyncWeek: Story = {
    name: 'Week — async via MSW',
    render: () => <Frame><Scheduler loadEvents={loadEvents} defaultView="week" onNewEvent={() => alert('New event')} onSelectEvent={(e) => alert(e.title)} /></Frame>,
}

export const Controlled: Story = {
    name: 'Controlled events',
    render: () => <Frame><Scheduler events={DEMO_EVENTS} onSelectEvent={(e) => alert(e.title)} onSelectSlot={(d) => alert(d.toDateString())} /></Frame>,
}

export const BusinessHoursWeek: Story = {
    name: 'Week — business hours (7–20)',
    render: () => <Frame><Scheduler events={DEMO_EVENTS} defaultView="week" dayHours={[7, 20]} /></Frame>,
}

export const AsyncError: Story = {
    name: 'Async error + retry',
    parameters: {
        msw: { handlers: [http.get('/api/scheduler/events', async () => { await delay(400); return HttpResponse.error() })] },
        docs: { description: { story: 'When `loadEvents` rejects, the Scheduler surfaces a retry state (and fires `onError`) instead of silently showing an empty calendar. The mocked endpoint here always fails.' } },
    },
    render: () => <Frame><Scheduler loadEvents={loadEvents} onError={(e) => console.warn('Scheduler load failed', e)} /></Frame>,
}

export const Editable: Story = {
    name: 'Create / delete (controlled)',
    parameters: { docs: { description: { story: 'CRUD is consumer-owned: click empty space to create, click an event to delete. The Scheduler just reports the intent via onSelectSlot / onSelectEvent; you mutate your own state.' } } },
    render: () => {
        const Demo = () => {
            const [events, setEvents] = useState<SchedulerEvent[]>(DEMO_EVENTS)
            return (
                <Scheduler
                    events={events}
                    onSelectSlot={(d) => {
                        const title = window.prompt('New event title')
                        if (!title) return
                        setEvents((e) => [...e, { id: Date.now(), title, start: d, end: new Date(d.getTime() + 3_600_000), color: COLORS[e.length % COLORS.length] }])
                    }}
                    onSelectEvent={(ev) => { if (window.confirm(`Delete "${ev.title}"?`)) setEvents((e) => e.filter((x) => x.id !== ev.id)) }}
                    onNewEvent={() => window.alert('Wire this to your own create form / modal')}
                />
            )
        }
        return <Frame><Demo /></Frame>
    },
}

export const Playground: Story = {
    args: { defaultView: 'month', hourHeight: 48 },
    argTypes: {
        defaultView: { control: 'inline-radio', options: ['month', 'week'] },
        hourHeight: { control: { type: 'number', min: 32, max: 96, step: 4 } },
    },
    render: (args) => (
        <Frame>
            <Scheduler events={DEMO_EVENTS} defaultView={args.defaultView} hourHeight={args.hourHeight} onSelectEvent={(e) => alert(e.title)} />
        </Frame>
    ),
}
