import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Table from './Table'
import type { TableColumn } from './Table'

const meta: Meta<typeof Table> = {
    title: 'Core/Table',
    component: Table,
    parameters: { layout: 'padded' },
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Table>

const COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID', keyBind: 'id' },
    { key: 'name', label: 'Name', keyBind: 'name' },
    { key: 'status', label: 'Status', keyBind: 'status' },
    { key: 'port', label: 'Port', keyBind: 'port' },
]

const ROWS = Array.from({ length: 32 }, (_, i) => ({
    key: `row-${i + 1}`,
    id: i + 1,
    name: `Vessel ${String.fromCharCode(65 + (i % 26))}`,
    status: i % 3 === 0 ? 'At Sea' : i % 3 === 1 ? 'In Port' : 'Anchored',
    port: ['Piraeus', 'Rotterdam', 'Singapore', 'Houston'][i % 4],
}))

export const Default: Story = {
    args: { columns: COLUMNS, rows: ROWS, pagination: { enabled: true, perPage: 10, withPicker: true } },
}

export const NoPagination: Story = {
    args: { columns: COLUMNS, rows: ROWS.slice(0, 5), pagination: { enabled: false }, hasSearch: false },
}

export const ServerSide: Story = {
    args: {
        columns: COLUMNS,
        rows: ROWS.slice(0, 10),
        pagination: {
            enabled: true,
            serverSide: true,
            page: 1,
            totalCount: 100,
            perPage: 10,
            withPicker: true,
            onPageChange: (p) => console.log('page:', p),
            onPerPageChange: (pp) => console.log('perPage:', pp),
        },
    },
}
