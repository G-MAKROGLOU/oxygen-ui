import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Timeline, { type TimelineEvent } from './Timeline'

const events: TimelineEvent[] = [
    { key: 1, title: 'Order placed', timestamp: 'Mon' },
    { key: 2, title: 'Shipped' },
    { key: 3, title: 'Delivered' },
]

describe('Timeline', () => {
    it('renders all events and their meta', () => {
        render(<Timeline current={1} events={events} />)
        expect(screen.getByText('Order placed')).toBeInTheDocument()
        expect(screen.getByText('Shipped')).toBeInTheDocument()
        expect(screen.getByText('Delivered')).toBeInTheDocument()
        expect(screen.getByText('Mon')).toBeInTheDocument()
    })

    it('renders one list item per event', () => {
        const { container } = render(<Timeline current={1} events={events} />)
        expect(container.querySelectorAll('ol > li').length).toBe(3)
    })

    it('respects an explicit error status', () => {
        const { container } = render(
            <Timeline events={[{ key: 1, title: 'Payment', status: 'error' }]} />,
        )
        // error node carries the error background token
        expect(container.querySelector('.bg-status-error')).not.toBeNull()
    })
})
