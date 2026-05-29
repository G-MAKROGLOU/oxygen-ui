import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Grid from './Grid'
import Box from './Box'
import Typography from '../core/Typography'

const meta: Meta<typeof Grid> = {
    title: 'Layout/Grid',
    component: Grid,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    '`Box` with `display: grid`. Use `cols` / `rows` as numbers for N equal tracks, or as CSS strings for arbitrary layouts (auto-fit grids, fixed-width sidebars, etc.).',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof Grid>

const Card = ({ i }: { i: number }) => (
    <Box p="md" background="surface" border="border" radius="lg">
        <Typography variant="h4">Card {i}</Typography>
        <Typography variant="caption" color="foreground-secondary" className="mt-1">
            Cell content
        </Typography>
    </Box>
)

export const ThreeColumns: Story = {
    render: () => (
        <Grid cols={3} gap="md">
            {Array.from({ length: 6 }, (_, i) => <Card key={i} i={i + 1} />)}
        </Grid>
    ),
}

export const AutoFit: Story = {
    name: 'Auto-fit (responsive)',
    parameters: {
        docs: {
            description: {
                story:
                    "Pass any CSS grid-template-columns string to `cols`. `'repeat(auto-fit, minmax(180px, 1fr))'` makes the grid wrap based on available width.",
            },
        },
    },
    render: () => (
        <Grid cols="repeat(auto-fit, minmax(180px, 1fr))" gap="md">
            {Array.from({ length: 8 }, (_, i) => <Card key={i} i={i + 1} />)}
        </Grid>
    ),
}

export const TwoColumnLayout: Story = {
    name: 'Sidebar layout',
    parameters: {
        docs: {
            description: {
                story:
                    'Fixed-width first track + flexible second track — `cols="240px 1fr"` produces a classic sidebar + content layout.',
            },
        },
    },
    render: () => (
        <Grid cols="240px 1fr" gap="lg">
            <Box p="md" background="surface-raised" radius="md">
                <Typography variant="h4">Sidebar</Typography>
            </Box>
            <Box p="md" background="surface" border="border" radius="md">
                <Typography variant="h4">Content</Typography>
            </Box>
        </Grid>
    ),
}
