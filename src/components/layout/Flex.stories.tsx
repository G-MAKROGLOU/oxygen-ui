import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Flex from './Flex'
import Box from './Box'
import Typography from '../core/Typography'

const meta: Meta<typeof Flex> = {
    title: 'Layout/Flex',
    component: Flex,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    '`Box` with `display: flex` baked in. All Box props are accepted; flex-specific props are `direction`, `align`, `justify`, `wrap`, `gap`, `inline`.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof Flex>

const Pill = ({ n }: { n: number }) => (
    <Box p="md" background="accent" radius="md">
        <Typography variant="caption" color="inherit">Item {n}</Typography>
    </Box>
)

export const Row: Story = {
    render: () => (
        <Flex direction="row" align="center" gap="md">
            <Pill n={1} /><Pill n={2} /><Pill n={3} />
        </Flex>
    ),
}

export const Column: Story = {
    render: () => (
        <Flex direction="col" gap="md">
            <Pill n={1} /><Pill n={2} /><Pill n={3} />
        </Flex>
    ),
}

export const JustifyBetween: Story = {
    render: () => (
        <Flex direction="row" justify="between" align="center" gap="md" p="md" background="surface-raised" radius="md">
            <Typography variant="h3">Vessel #142</Typography>
            <Typography variant="caption" color="foreground-secondary">at sea · 12 kts</Typography>
        </Flex>
    ),
}

export const Wrap: Story = {
    render: () => (
        <Flex direction="row" wrap="wrap" gap="sm">
            {Array.from({ length: 12 }, (_, i) => <Pill key={i} n={i + 1} />)}
        </Flex>
    ),
}
