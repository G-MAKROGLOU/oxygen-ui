import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Cart, { type CartLineItem } from './Cart'
import EmptyCart from './EmptyCart'
import Button from '../inputs/Button'

const meta: Meta<typeof Cart> = {
    title: 'E-Commerce/Cart',
    component: Cart,
    parameters: { layout: 'centered' },
    decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Cart>

const seed: CartLineItem[] = [
    { id: 1, name: 'Marine radar unit', meta: 'X-band · 4 ft', price: 1290, quantity: 1, max: 5 },
    { id: 2, name: 'AIS transponder', meta: 'Class B', price: 449.99, quantity: 2 },
    { id: 3, name: 'Cable harness', meta: '10 m', price: 39.5, quantity: 1 },
]

export const Default: Story = {
    render: () => {
        const [items, setItems] = useState(seed)
        return (
            <Cart
                items={items}
                onQuantityChange={(id, q) => setItems((p) => p.map((it) => (it.id === id ? { ...it, quantity: q } : it)))}
                onRemove={(id) => setItems((p) => p.filter((it) => it.id !== id))}
                summaryRows={[
                    { label: 'Shipping', value: 24 },
                    { label: 'Promo (SAVE10)', value: -50, muted: true },
                ]}
                onCheckout={() => alert('Proceeding to checkout')}
            />
        )
    },
}

export const Empty: Story = {
    name: 'Empty (default illustration)',
    render: () => <Cart items={[]} />,
}

export const EmptyConfigured: Story = {
    name: 'Empty (configured)',
    render: () => (
        <Cart
            items={[]}
            emptyState={
                <EmptyCart
                    title="No items yet"
                    description="Browse the catalog to add marine equipment to your order."
                    action={<Button content="Browse products" variant="secondary" size="sm" />}
                />
            }
        />
    ),
}
