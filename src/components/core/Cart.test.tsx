import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import Cart, { type CartLineItem } from './Cart'

const items: CartLineItem[] = [
    { id: 1, name: 'Radar', price: 100, quantity: 1, max: 3 },
    { id: 2, name: 'Cable', price: 25, quantity: 2 },
]

describe('Cart', () => {
    it('computes subtotal and total with summary rows', () => {
        render(<Cart items={items} summaryRows={[{ label: 'Shipping', value: 10 }]} />)
        // subtotal = 100 + 50 = 150
        const subtotal = screen.getByText('Subtotal').closest('div')!
        expect(within(subtotal).getByText('$150.00')).toBeInTheDocument()
        // total = 150 + 10
        const total = screen.getByText('Total').closest('div')!
        expect(within(total).getByText('$160.00')).toBeInTheDocument()
    })

    it('steps quantity and clamps at the max', () => {
        const onQty = vi.fn()
        render(<Cart items={items} onQuantityChange={onQty} />)
        const radarRow = screen.getByText('Radar').closest('li')!
        fireEvent.click(within(radarRow).getByRole('button', { name: 'Increase quantity' }))
        expect(onQty).toHaveBeenCalledWith(1, 2)
    })

    it('disables decrease at quantity 1', () => {
        render(<Cart items={items} />)
        const radarRow = screen.getByText('Radar').closest('li')!
        expect(within(radarRow).getByRole('button', { name: 'Decrease quantity' })).toBeDisabled()
    })

    it('removes a line', () => {
        const onRemove = vi.fn()
        render(<Cart items={items} onRemove={onRemove} />)
        const cableRow = screen.getByText('Cable').closest('li')!
        fireEvent.click(within(cableRow).getByRole('button', { name: 'Remove' }))
        expect(onRemove).toHaveBeenCalledWith(2)
    })

    it('shows the default empty state', () => {
        render(<Cart items={[]} />)
        expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    })

    it('renders a custom empty state when provided', () => {
        render(<Cart items={[]} emptyState={<div>Nothing to see</div>} />)
        expect(screen.getByText('Nothing to see')).toBeInTheDocument()
    })
})
