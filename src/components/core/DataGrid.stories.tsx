import React, { useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import DataGrid, { type GridColumn, type CellValue } from './DataGrid'

const meta: Meta<typeof DataGrid> = {
    title: 'Data Display/DataGrid',
    component: DataGrid,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof DataGrid>

const columns: GridColumn[] = [
    { key: 'id', label: '#', width: 70, align: 'right' },
    { key: 'name', label: 'Name', width: 200 },
    { key: 'role', label: 'Role', width: 160 },
    { key: 'score', label: 'Score', width: 100, align: 'right', editable: true },
]

const rows: Array<Record<string, CellValue>> = [
    { id: 1, name: 'Ada Lovelace', role: 'Engineer', score: 98 },
    { id: 2, name: 'Alan Turing', role: 'Researcher', score: 99 },
    { id: 3, name: 'Grace Hopper', role: 'Admiral', score: 97 },
]

export const Default: Story = {
    render: () => <DataGrid columns={columns} rows={rows} height={300} />,
}

export const Editable: Story = {
    name: 'Editable (double-click the Score column)',
    render: () => <DataGrid columns={columns} rows={rows} editable height={300} onCellEdit={(e) => console.log(e)} />,
}

export const Empty: Story = {
    render: () => <DataGrid columns={columns} rows={[]} height={240} />,
}

export const Massive: Story = {
    name: 'Virtualized — 100,000 rows × 40 cols',
    render: () => {
        const { cols, data } = useMemo(() => {
            const cols: GridColumn[] = Array.from({ length: 40 }, (_, i) => ({ key: `c${i}`, label: `Column ${i + 1}`, width: 130 }))
            const data = Array.from({ length: 100000 }, (_, r) => {
                const rec: Record<string, CellValue> = {}
                cols.forEach((c, i) => { rec[c.key] = `${r}.${i}` })
                return rec
            })
            return { cols, data }
        }, [])
        return <DataGrid columns={cols} rows={data} editable height={560} />
    },
}
