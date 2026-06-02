import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Testimonials, { type Testimonial } from './Testimonials'

const meta: Meta<typeof Testimonials> = {
    title: 'Marketing/Testimonials',
    component: Testimonials,
    parameters: { layout: 'fullscreen' },
    argTypes: { columns: { control: 'inline-radio', options: [1, 2, 3] } },
    decorators: [(Story) => <div className="mx-auto max-w-6xl p-8"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Testimonials>

const items: Testimonial[] = [
    { quote: 'Cut our monthly reporting from two days to two hours. The compliance suite alone paid for itself.', author: 'Maria Ferreira', role: 'Fleet Manager, Aegean Lines', avatar: 'https://i.pravatar.cc/64?img=47', rating: 5 },
    { quote: 'Finally a dashboard the whole crew can read at a glance. Ship-to-shore sync is seamless.', author: 'Tom Becker', role: 'Operations, NordWave', avatar: 'https://i.pravatar.cc/64?img=12', rating: 5 },
    { quote: 'The voyage analytics surfaced fuel drift we’d missed for months. Real money saved.', author: 'Priya Nair', role: 'Performance Lead, BlueHorizon', avatar: 'https://i.pravatar.cc/64?img=32', rating: 4 },
]

export const Grid: Story = {
    args: { eyebrow: 'Testimonials', title: 'Loved by operations teams', columns: 3, testimonials: items },
}

export const Featured: Story = {
    name: 'Single featured quote',
    args: { columns: 1, testimonials: [items[0]] },
}
