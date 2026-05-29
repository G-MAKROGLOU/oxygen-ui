import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import AutoComplete, { type AutoCompleteItem } from './AutoComplete'

const PORTS: AutoCompleteItem[] = [
    { key: 'piraeus',   value: 'GRPIR', label: 'Piraeus'   },
    { key: 'rotterdam', value: 'NLRTM', label: 'Rotterdam' },
    { key: 'singapore', value: 'SGSIN', label: 'Singapore' },
    { key: 'houston',   value: 'USHOU', label: 'Houston'   },
    { key: 'shanghai',  value: 'CNSHA', label: 'Shanghai'  },
    { key: 'hamburg',   value: 'DEHAM', label: 'Hamburg'   },
    { key: 'antwerp',   value: 'BEANR', label: 'Antwerp'   },
    { key: 'busan',     value: 'KRPUS', label: 'Busan'     },
]

const meta: Meta<typeof AutoComplete> = {
    title: 'Inputs/AutoComplete',
    component: AutoComplete,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Search-as-you-type autocomplete. Two modes: pass `items` for a small fixed list (local substring filter), or `onSearch(term) => Promise<Item[]>` for a server-backed lookup with debounce + loading spinner.',
            },
        },
    },
    args: { label: 'Port of call', placeholder: 'Type to search…' },
}
export default meta
type Story = StoryObj<typeof AutoComplete>

export const Static: Story = {
    name: 'Static — local filter',
    args: { items: PORTS },
}

export const Empty: Story = {
    args: { items: PORTS, emptyText: 'No matching ports' },
}

export const Disabled: Story = {
    args: { items: PORTS, disabled: true },
}

export const WithError: Story = {
    args: { items: PORTS, errorMessage: 'Select a port of call', required: true },
}

// ── Async mode ──────────────────────────────────────────────────────────────

// Simulate a server query with 800 ms latency.
async function fakeServerSearch(term: string): Promise<AutoCompleteItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const t = term.toLowerCase()
    return PORTS.filter(
        (p) => p.label.toLowerCase().includes(t) || p.value.toLowerCase().includes(t),
    )
}

export const Async: Story = {
    name: 'Async — server-backed',
    parameters: {
        docs: {
            description: {
                story:
                    'When `onSearch` is provided, the component debounces input (`debounce` ms, default 250) and drives the option list from the resolver. While the promise is pending, an `xs` LoadingSpinner replaces the magnifier icon and the popover shows a "Searching…" message.',
            },
        },
    },
    args: { onSearch: fakeServerSearch, debounce: 300 },
}

export const AsyncFastDebounce: Story = {
    name: 'Async — 100 ms debounce',
    parameters: {
        docs: {
            description: {
                story:
                    'Tune `debounce` to balance UX vs. server cost. 100 ms feels instant; 500 ms is calmer for slow-rendering remote services.',
            },
        },
    },
    args: { onSearch: fakeServerSearch, debounce: 100 },
}
