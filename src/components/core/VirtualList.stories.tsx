import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import VirtualList from './VirtualList'
import Badge from './Badge'

const meta: Meta<typeof VirtualList> = {
    title: 'Data Display/VirtualList',
    component: VirtualList,
    parameters: { layout: 'padded' },
    decorators: [(Story) => <div className="mx-auto max-w-xl"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof VirtualList>

interface Vessel { id: number; name: string; imo: string; status: string }
const VESSELS: Vessel[] = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Vessel ${String.fromCharCode(65 + (i % 26))}-${i}`,
    imo: `IMO${9000000 + i}`,
    status: i % 3 === 0 ? 'At Sea' : i % 3 === 1 ? 'In Port' : 'Anchored',
}))

const Row = (v: Vessel) => (
    <div className="flex items-center justify-between border-b border-border px-4 py-2 hover:bg-surface-raised">
        <div>
            <div className="text-sm font-medium text-foreground">{v.name}</div>
            <div className="text-xs text-foreground-muted">{v.imo}</div>
        </div>
        <Badge tone={v.status === 'At Sea' ? 'accent' : v.status === 'In Port' ? 'success' : 'neutral'} variant="soft" size="sm">{v.status}</Badge>
    </div>
)

export const TenThousandRows: Story = {
    name: '10,000 rows',
    args: {
        items: VESSELS,
        rowHeight: 56,
        height: 420,
        getKey: (v: Vessel) => v.id,
        renderItem: (v: Vessel) => <Row {...v} />,
    },
}

export const Searchable: Story = {
    args: {
        items: VESSELS,
        rowHeight: 56,
        height: 420,
        searchable: true,
        searchKeys: ['name', 'imo'],
        searchPlaceholder: 'Search 10,000 vessels…',
        getKey: (v: Vessel) => v.id,
        renderItem: (v: Vessel) => <Row {...v} />,
    },
}

export const Compact: Story = {
    args: {
        items: VESSELS,
        rowHeight: 32,
        height: 300,
        getKey: (v: Vessel) => v.id,
        renderItem: (v: Vessel) => <div className="border-b border-border px-3 py-1.5 text-sm text-foreground-secondary">{v.name}</div>,
    },
}
