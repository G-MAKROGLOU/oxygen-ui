import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import TimePicker from './TimePicker'

const meta: Meta<typeof TimePicker> = {
    title: 'Inputs/TimePicker',
    component: TimePicker,
    tags: ['autodocs'],
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
        layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
        label: { control: 'text' },
        placeholder: { control: 'text' },
        helperText: { control: 'text' },
        errorMessage: { control: 'text' },
        disabled: { control: 'boolean' },
        required: { control: 'boolean' },
    },
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Time picker with scrollable hour / minute (/ second) columns. Value is a 24-hour `"HH:mm"` string regardless of 12/24h display, so it is stable to store and submit.',
            },
        },
    },
    decorators: [(S) => <div className="w-64"><S /></div>],
}
export default meta
type Story = StoryObj<typeof TimePicker>

function Controlled(args: React.ComponentProps<typeof TimePicker>) {
    const [v, setV] = useState<string | null>(args.value ?? null)
    return <TimePicker {...args} value={v} onChange={setV} />
}

export const Default: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Time' } }
export const TwelveHour: Story = { name: '12-hour + AM/PM', render: (a) => <Controlled {...a} />, args: { label: 'Departure', use12Hours: true, value: '14:30' } }
export const Stepped: Story = { name: '15-minute step', render: (a) => <Controlled {...a} />, args: { label: 'Slot', minuteStep: 15 } }
export const WithSeconds: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Precise', withSeconds: true } }
export const WithError: Story = { render: (a) => <Controlled {...a} />, args: { label: 'Time', errorMessage: 'Required' } }
