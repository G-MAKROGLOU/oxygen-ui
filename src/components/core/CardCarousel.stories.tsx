import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import CardCarousel from './CardCarousel'
import Card from './Card'

const meta: Meta<typeof CardCarousel> = {
    title: 'Data Display/CardCarousel',
    component: CardCarousel,
    parameters: { layout: 'padded' },
    argTypes: {
        variant: { control: 'inline-radio', options: ['flat', 'rotating'] },
        showArrows: { control: 'boolean' },
        showDots: { control: 'boolean' },
        itemWidth: { control: { type: 'number' } },
    },
    decorators: [(Story) => <div style={{ maxWidth: 720, margin: '0 auto' }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof CardCarousel>

const items = ['Aurora', 'Beacon', 'Catalina', 'Dauntless', 'Everest', 'Falcon']

export const Flat: Story = {
    args: { variant: 'flat', itemWidth: 240, showArrows: true, showDots: true },
    render: (args) => (
        <CardCarousel {...args}>
            {items.map((name, i) => (
                <Card key={name}>
                    <Card.Media>
                        <div className="h-28 bg-gradient-to-br from-accent/30 to-accent/5" />
                    </Card.Media>
                    <Card.Header title={name} subtitle={`Vessel #${i + 1}`} />
                    <Card.Body>Snap-scroll horizontally, or use the arrows and dots.</Card.Body>
                </Card>
            ))}
        </CardCarousel>
    ),
}

export const Rotating: Story = {
    args: { variant: 'rotating', itemWidth: 300, showArrows: true, showDots: true },
    render: (args) => (
        <CardCarousel {...args}>
            {items.map((name, i) => (
                <Card key={name}>
                    <Card.Media>
                        <div className="h-28 bg-gradient-to-br from-accent/30 to-accent/5" />
                    </Card.Media>
                    <Card.Header title={name} subtitle={`Vessel #${i + 1}`} />
                    <Card.Body>The active card sits centre-stage; neighbours fall back behind it. Click a side card, use the arrows/dots, or press ←/→.</Card.Body>
                </Card>
            ))}
        </CardCarousel>
    ),
}
