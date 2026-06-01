import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Calendar from './Calendar'

const meta: Meta<typeof Calendar> = {
    title: 'Data Display/Calendar',
    component: Calendar,
    parameters: { layout: 'centered' },
    argTypes: { weekStartsOn: { control: 'inline-radio', options: [0, 1] } },
}
export default meta
type Story = StoryObj<typeof Calendar>

export const Default: Story = {
    render: (args) => {
        const [day, setDay] = useState<Date | null>(null)
        return <Calendar {...args} value={day} onChange={setDay} />
    },
}

export const WithEvents: Story = {
    render: () => {
        const [day, setDay] = useState<Date | null>(new Date())
        const base = new Date()
        const mk = (offset: number) => new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset)
        return (
            <Calendar
                value={day}
                onChange={setDay}
                events={[
                    { date: mk(0), label: 'Standup', color: 'var(--color-status-info)' },
                    { date: mk(0), label: 'Review' },
                    { date: mk(2), label: 'Deploy', color: 'var(--color-status-success)' },
                    { date: mk(5), label: 'Deadline', color: 'var(--color-status-error)' },
                ]}
            />
        )
    },
}

export const Bounded: Story = {
    name: 'Min / max',
    render: () => {
        const [day, setDay] = useState<Date | null>(null)
        const base = new Date()
        return (
            <Calendar
                value={day}
                onChange={setDay}
                min={new Date(base.getFullYear(), base.getMonth(), 5)}
                max={new Date(base.getFullYear(), base.getMonth(), 24)}
                weekStartsOn={1}
            />
        )
    },
}
