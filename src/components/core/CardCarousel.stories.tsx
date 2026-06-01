import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import CardCarousel from './CardCarousel'
import Card from './Card'

const meta: Meta<typeof CardCarousel> = {
    title: 'Data Display/CardCarousel',
    component: CardCarousel,
    parameters: { layout: 'padded' },
    argTypes: {
        showArrows: { control: 'boolean' },
        showDots: { control: 'boolean' },
        itemWidth: { control: { type: 'number' } },
    },
    decorators: [(Story) => <div style={{ maxWidth: 720, margin: '0 auto' }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof CardCarousel>

const items = ['Aurora', 'Beacon', 'Catalina', 'Dauntless', 'Everest', 'Falcon']

export const Default: Story = {
    args: { itemWidth: 240, showArrows: true, showDots: true },
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
