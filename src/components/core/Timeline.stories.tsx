import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Timeline, { type TimelineEvent } from './Timeline'

const meta: Meta<typeof Timeline> = {
    title: 'Data Display/Timeline',
    component: Timeline,
    parameters: { layout: 'padded' },
    argTypes: {
        current: { control: { type: 'number', min: 0, max: 4 } },
    },
    decorators: [(Story) => <div style={{ maxWidth: 380 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Timeline>

const order: TimelineEvent[] = [
    { key: 1, title: 'Order placed', description: 'We received your order.', timestamp: 'Mon 09:24' },
    { key: 2, title: 'Gathering products', description: 'Items picked from the warehouse.', timestamp: 'Mon 11:02' },
    { key: 3, title: 'Out for shipping', description: 'Handed to the carrier.', timestamp: 'Tue 08:15' },
    { key: 4, title: 'Out for delivery', description: 'On the delivery vehicle.' },
    { key: 5, title: 'Delivered' },
]

export const OrderTracking: Story = {
    args: { current: 2, events: order },
}

export const Completed: Story = {
    args: { current: 5, events: order },
}

export const WithError: Story = {
    render: () => (
        <Timeline
            events={[
                { key: 1, title: 'Payment authorized', status: 'complete', timestamp: '09:24' },
                { key: 2, title: 'Processing', status: 'complete', timestamp: '09:25' },
                { key: 3, title: 'Payment captured', status: 'error', description: 'Card declined — please retry.', timestamp: '09:26' },
                { key: 4, title: 'Fulfilment', status: 'upcoming' },
            ]}
        />
    ),
}
