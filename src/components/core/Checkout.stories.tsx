import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Checkout from './Checkout'
import { CartProvider, type CartLineItem } from './CartProvider'

const meta: Meta<typeof Checkout> = {
    title: 'E-Commerce/Checkout',
    component: Checkout,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Checkout>

const seed: CartLineItem[] = [
    { id: 1, name: 'Marine radar unit', meta: 'X-band · 4 ft', price: 1290, quantity: 1, max: 5 },
    { id: 2, name: 'AIS transponder', meta: 'Class B', price: 449.99, quantity: 2 },
    { id: 3, name: 'Cable harness', meta: '10 m', price: 39.5, quantity: 1 },
]

const SUMMARY = [
    { label: 'Shipping', value: 24 },
    { label: 'Tax (8%)', value: 178.36 },
]

export const Default: Story = {
    name: 'With items',
    render: () => (
        <CartProvider initialItems={seed}>
            <Checkout
                summaryRows={SUMMARY}
                onPaid={(card) => alert(`Charged card ending ${card.number.slice(-4)}`)}
            />
        </CartProvider>
    ),
}

export const EmptyCartDisablesPayment: Story = {
    name: 'Empty cart (pay disabled)',
    render: () => (
        <CartProvider initialItems={[]}>
            <Checkout summaryRows={[]} />
        </CartProvider>
    ),
}
