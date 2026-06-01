import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Accordion from './Accordion'

const meta: Meta<typeof Accordion> = {
    title: 'Data Display/Accordion',
    component: Accordion,
    parameters: { layout: 'centered' },
    argTypes: {
        type: { control: 'inline-radio', options: ['single', 'multiple'] },
        variant: { control: 'inline-radio', options: ['separated', 'contained'] },
        collapsible: { control: 'boolean' },
    },
    decorators: [(Story) => <div style={{ width: 440 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Accordion>

const Spark = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>

export const Default: Story = {
    args: { type: 'single', variant: 'separated', collapsible: true },
    render: (args) => (
        <Accordion {...args} defaultValue="a">
            <Accordion.Item value="a" title="What is included in the Pro plan?">
                Everything in Starter, plus unlimited projects, priority support, and SSO.
            </Accordion.Item>
            <Accordion.Item value="b" title="Can I cancel anytime?">
                Yes. Cancel from billing settings — your plan stays active until the end of the period.
            </Accordion.Item>
            <Accordion.Item value="c" title="Do you offer discounts?">
                Annual billing saves 20%, and we have dedicated nonprofit and education pricing.
            </Accordion.Item>
        </Accordion>
    ),
}

export const Contained: Story = {
    args: { type: 'single', variant: 'contained' },
    render: (args) => (
        <Accordion {...args} defaultValue="a">
            <Accordion.Item value="a" icon={Spark} title="Performance">
                Edge-cached responses and streaming keep first paint under 100ms.
            </Accordion.Item>
            <Accordion.Item value="b" icon={Spark} title="Security">
                SOC 2 Type II, encryption at rest and in transit, granular access controls.
            </Accordion.Item>
            <Accordion.Item value="c" icon={Spark} title="Support" disabled>
                (Disabled item) Enterprise support add-on.
            </Accordion.Item>
        </Accordion>
    ),
}

export const Multiple: Story = {
    args: { type: 'multiple', variant: 'separated' },
    render: (args) => (
        <Accordion {...args} defaultValue={['a', 'c']}>
            <Accordion.Item value="a" title="Section one">Open by default, and others can open too.</Accordion.Item>
            <Accordion.Item value="b" title="Section two">Toggle me independently.</Accordion.Item>
            <Accordion.Item value="c" title="Section three">Also open by default.</Accordion.Item>
        </Accordion>
    ),
}
