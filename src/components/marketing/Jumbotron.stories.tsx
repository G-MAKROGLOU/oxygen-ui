import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Jumbotron from './Jumbotron'
import Button from '../inputs/Button'
import Badge from '../core/Badge'

const meta: Meta<typeof Jumbotron> = {
    title: 'Marketing/Jumbotron',
    component: Jumbotron,
    parameters: { layout: 'fullscreen' },
    argTypes: {
        layout: { control: 'inline-radio', options: ['centered', 'split'] },
        background: { control: 'inline-radio', options: ['none', 'surface', 'gradient'] },
    },
    decorators: [(Story) => <div className="p-6"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Jumbotron>

const Media = () => <div className="aspect-[16/10] w-full rounded-xl bg-gradient-to-br from-accent/30 to-accent/5" />
const CTAs = (
    <>
        <Button content="Get started" />
        <Button variant="outline" content="Book a demo" />
    </>
)

export const Centered: Story = {
    args: {
        background: 'gradient',
        eyebrow: <Badge tone="accent" variant="soft">New · v6</Badge>,
        title: 'Ship maritime operations faster',
        description: 'One portal for compliance, performance and voyage data — built for the teams that keep fleets moving.',
        actions: CTAs,
    },
}

export const Split: Story = {
    args: {
        layout: 'split',
        eyebrow: <Badge tone="accent" variant="soft">Platform</Badge>,
        title: 'Every metric, one screen',
        description: 'Live AIS, fuel and emissions in a single dashboard your whole crew can read at a glance.',
        actions: CTAs,
        media: <Media />,
    },
}

export const WithMediaBelow: Story = {
    name: 'Centered + media',
    args: {
        background: 'gradient',
        title: 'See your fleet in real time',
        description: 'A calm, legible command center for vessel performance.',
        actions: CTAs,
        media: <Media />,
    },
}

export const OnSurface: Story = {
    args: {
        background: 'surface',
        title: 'Simple, honest pricing',
        description: 'Start free, scale when you’re ready.',
        actions: <Button content="View plans" />,
    },
}
