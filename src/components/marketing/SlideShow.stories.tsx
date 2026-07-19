import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import SlideShow from './SlideShow'
import Button from '../inputs/Button'

const meta: Meta<typeof SlideShow> = {
    title: 'Marketing/SlideShow',
    component: SlideShow,
    parameters: { layout: 'fullscreen' },
    argTypes: {
        autoPlay: { control: 'boolean' },
        interval: { control: { type: 'number', step: 500 } },
        showArrows: { control: 'boolean' },
        showDots: { control: 'boolean' },
        height: { control: { type: 'number', step: 20 } },
    },
    decorators: [(Story) => <div className="p-6"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof SlideShow>

const img = (seed: string) => `https://picsum.photos/seed/${seed}/1400/700`

export const Hero: Story = {
    args: {
        height: 460,
        slides: [
            { eyebrow: 'Fleet intelligence', title: 'Command your fleet from one screen', description: 'Live AIS, fuel and emissions, calm, legible, always current.', image: img('ocean1'), actions: <><Button content="Get started" /><Button variant="outline" content="Watch demo" /></> },
            { eyebrow: 'Compliance', title: 'Stay ahead of CII & EU-ETS', description: 'Automated reporting that turns red days into a plan.', image: img('port2'), actions: <Button content="See compliance" /> },
            { eyebrow: 'Performance', title: 'Cut fuel, not corners', description: 'Voyage optimisation grounded in real vessel data.', image: img('ship3'), actions: <Button content="Explore" /> },
        ],
    },
}

export const LeftAligned: Story = {
    args: {
        height: 460,
        slides: [
            { align: 'start', eyebrow: 'New', title: 'Built for the open sea', description: 'A maritime operations portal your whole crew can read at a glance.', image: img('sea7'), actions: <Button content="Start free" /> },
            { align: 'start', title: 'One source of truth', description: 'No more spreadsheets scattered across the bridge.', image: img('harbor8') },
        ],
    },
}

export const NoImage: Story = {
    name: 'Surface (no image)',
    args: {
        height: 380,
        slides: [
            { eyebrow: 'Welcome', title: 'Simple, honest pricing', description: 'Start free, scale when you’re ready.', actions: <Button content="View plans" /> },
            { eyebrow: 'Trusted', title: 'Loved by ops teams worldwide', description: 'From coastal operators to global carriers.' },
        ],
    },
}

export const Single: Story = {
    name: 'Single slide (static)',
    args: {
        height: 420,
        autoPlay: false,
        slides: [{ eyebrow: 'Announcement', title: 'oxygen-ui 1.0 is here', description: 'A calibrated component library for enterprise interfaces.', image: img('solo9'), actions: <Button content="Read the notes" /> }],
    },
}
