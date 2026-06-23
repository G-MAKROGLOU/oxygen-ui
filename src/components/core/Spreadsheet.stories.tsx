import React, { useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Spreadsheet, { type SheetData } from './Spreadsheet'

const meta: Meta<typeof Spreadsheet> = {
    title: 'Data Display/Spreadsheet',
    component: Spreadsheet,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Spreadsheet>

const fleet: SheetData = {
    name: 'Fleet',
    columns: [
        { key: 'imo', label: 'IMO', width: 110 },
        { key: 'name', label: 'Vessel', width: 200 },
        { key: 'type', label: 'Type', width: 140 },
        { key: 'dwt', label: 'DWT', width: 110, align: 'right' },
        { key: 'cii', label: 'CII', width: 80, align: 'center' },
    ],
    rows: [
        { imo: 9876543, name: 'MV Aurora', type: 'Bulk Carrier', dwt: 81200, cii: 'B' },
        { imo: 9123456, name: 'MV Borealis', type: 'Tanker', dwt: 115000, cii: 'C' },
        { imo: 9234567, name: 'MV Calypso', type: 'Container', dwt: 64000, cii: 'A' },
        { imo: 9345678, name: 'MV Dorado', type: 'Bulk Carrier', dwt: 93400, cii: 'D' },
    ],
}

const emissions: SheetData = {
    name: 'Emissions',
    columns: ['month', 'co2_tonnes', 'fuel_tonnes', 'distance_nm'],
    rows: [
        { month: 'Jan', co2_tonnes: 1240, fuel_tonnes: 396, distance_nm: 8200 },
        { month: 'Feb', co2_tonnes: 1180, fuel_tonnes: 377, distance_nm: 7900 },
        { month: 'Mar', co2_tonnes: 1320, fuel_tonnes: 421, distance_nm: 8600 },
    ],
}

export const Default: Story = {
    name: 'Multi-sheet + export',
    render: () => <Spreadsheet source={[fleet, emissions]} />,
}

export const Editable: Story = {
    name: 'Editable (double-click a cell)',
    render: () => <Spreadsheet source={[fleet]} editable onCellEdit={(e) => console.log('edit', e)} />,
}

export const LargeDataset: Story = {
    name: 'Virtualized — 50,000 rows',
    parameters: { docs: { description: { story: 'Both axes are windowed, so only the visible cells mount. Scroll vertically and horizontally — it stays smooth.' } } },
    render: () => {
        const big = useMemo<SheetData[]>(() => {
            const columns = Array.from({ length: 30 }, (_, i) => ({ key: `c${i}`, label: `Col ${i + 1}`, width: 120 }))
            const rows = Array.from({ length: 50000 }, (_, r) => {
                const rec: Record<string, number> = {}
                columns.forEach((c, i) => { rec[c.key] = r * 30 + i })
                return rec
            })
            return [{ name: 'Big', columns, rows }]
        }, [])
        return <Spreadsheet source={big} editable virtualize />
    },
}

export const CsvOnly: Story = {
    name: 'CSV export only',
    render: () => <Spreadsheet source={[emissions]} export={['csv']} />,
}
