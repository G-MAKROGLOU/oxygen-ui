import React, { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import Spreadsheet, { type SheetData } from './Spreadsheet'

const meta: Meta<typeof Spreadsheet> = {
    title: 'Data Display/Spreadsheet',
    component: Spreadsheet,

    parameters: { layout: 'padded' },
    argTypes: {
        editable: { control: 'boolean' },
        sortable: { control: 'boolean' },
        virtualize: { control: 'boolean' },
        height: { control: 'text' },
        width: { control: 'text' },
        emptyRows: { control: { type: 'number', min: 0 } },
        emptyCols: { control: { type: 'number', min: 0 } },
    },
}
export default meta
type Story = StoryObj<typeof Spreadsheet>

// ── Shared fixtures ───────────────────────────────────────────────────────────

const fleet: SheetData = {
    name: 'Fleet',
    columns: [
        { key: 'imo', label: 'IMO', width: 110 },
        { key: 'name', label: 'Vessel', width: 200 },
        { key: 'type', label: 'Type', width: 140 },
        { key: 'flag', label: 'Flag', width: 100 },
        { key: 'dwt', label: 'DWT', width: 110, align: 'right' },
        { key: 'gt', label: 'GT', width: 110, align: 'right' },
        { key: 'built', label: 'Built', width: 80, align: 'center' },
        { key: 'cii', label: 'CII', width: 60, align: 'center' },
        { key: 'status', label: 'Status', width: 120 },
    ],
    rows: [
        { imo: 9876543, name: 'MV Aurora', type: 'Bulk Carrier', flag: 'Marshall Is.', dwt: 81200, gt: 44500, built: 2018, cii: 'B', status: 'In service' },
        { imo: 9123456, name: 'MV Borealis', type: 'Tanker', flag: 'Panama', dwt: 115000, gt: 63200, built: 2015, cii: 'C', status: 'Drydock' },
        { imo: 9234567, name: 'MV Calypso', type: 'Container', flag: 'Liberia', dwt: 64000, gt: 51800, built: 2020, cii: 'A', status: 'In service' },
        { imo: 9345678, name: 'MV Dorado', type: 'Bulk Carrier', flag: 'Marshall Is.', dwt: 93400, gt: 52100, built: 2012, cii: 'D', status: 'In service' },
        { imo: 9456789, name: 'MV Eos', type: 'Tanker', flag: 'Greece', dwt: 72100, gt: 39600, built: 2019, cii: 'B', status: 'Laid up' },
        { imo: 9567890, name: 'MV Finisterre', type: 'Bulk Carrier', flag: 'Cyprus', dwt: 55800, gt: 31200, built: 2017, cii: 'A', status: 'In service' },
    ],
}

const emissions: SheetData = {
    name: 'Emissions',
    columns: [
        { key: 'month', label: 'Month', width: 120 },
        { key: 'vessel', label: 'Vessel', width: 180 },
        { key: 'co2', label: 'CO₂ (t)', width: 110, align: 'right' },
        { key: 'fuel', label: 'Fuel (t)', width: 110, align: 'right' },
        { key: 'distance', label: 'Distance (nm)', width: 140, align: 'right' },
        { key: 'eeoi', label: 'EEOI', width: 90, align: 'right' },
    ],
    rows: [
        { month: 'Jan 2024', vessel: 'MV Aurora', co2: 1240, fuel: 396, distance: 8200, eeoi: 8.14 },
        { month: 'Jan 2024', vessel: 'MV Borealis', co2: 1890, fuel: 603, distance: 9400, eeoi: 9.62 },
        { month: 'Feb 2024', vessel: 'MV Aurora', co2: 1180, fuel: 377, distance: 7900, eeoi: 8.02 },
        { month: 'Feb 2024', vessel: 'MV Borealis', co2: 1720, fuel: 549, distance: 8800, eeoi: 8.86 },
        { month: 'Mar 2024', vessel: 'MV Aurora', co2: 1320, fuel: 421, distance: 8600, eeoi: 8.27 },
        { month: 'Mar 2024', vessel: 'MV Borealis', co2: 1950, fuel: 622, distance: 9600, eeoi: 9.18 },
    ],
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
    name: 'Multi-sheet (read-only) with export',
    parameters: {
        docs: {
            description: {
                story:
                    'In-memory `SheetData[]` source — zero network requests. ' +
                    'Sheet tabs at the bottom switch between worksheets. ' +
                    'The File menu offers Open and Export (xlsx, csv, pdf) options.',
            },
        },
    },
    render: () => <Spreadsheet source={[fleet, emissions]} />,
}

export const Sortable: Story = {
    name: 'Sortable columns',
    parameters: {
        docs: {
            description: {
                story:
                    'Click any column header to sort ascending, click again for descending, a third click clears the sort. ' +
                    'Sorting is client-side and stable — row objects are never mutated. ' +
                    'Sorting is enabled by default; pass `sortable={false}` to disable.',
            },
        },
    },
    render: () => <Spreadsheet source={[fleet]} sortable />,
}

export const Editable: Story = {
    name: 'Editable — double-click to edit',
    parameters: {
        docs: {
            description: {
                story:
                    'Double-click any cell to open an inline editor. Press Enter or click away to commit, Escape to discard. ' +
                    'Values are coerced to the original cell type: editing a number cell produces a number, not a string. ' +
                    '`editable` also unlocks the Sheet menu (Add Sheet, Delete Sheet, Add 100 rows, Add 10 columns).',
            },
        },
    },
    render: () => {
        const EditableDemo = () => {
            const [sheets, setSheets] = useState([fleet])
            return (
                <div className="flex flex-col gap-3">
                    <Spreadsheet
                        source={sheets}
                        editable
                        onCellEdit={(e) => console.log('cell edit', e)}
                        onChange={(next) => { setSheets(next); console.log('onChange', next) }}
                    />
                    <p className="text-xs text-foreground-muted">Open the browser console to see onCellEdit and onChange payloads.</p>
                </div>
            )
        }
        return <EditableDemo />
    },
}

export const EditableWithContextMenus: Story = {
    name: 'Editable — context menus (right-click)',
    parameters: {
        docs: {
            description: {
                story:
                    'Right-click a **cell** for Copy / Cut / Paste. ' +
                    'Right-click the **row gutter** (the numbered column on the left) for Add row above / Add row below / Delete row. ' +
                    'Right-click a **column header** for Rename / Add column left / Add column right.',
            },
        },
    },
    render: () => (
        <Spreadsheet
            source={[fleet]}
            editable
            onCellEdit={(e) => console.log('cell edit', e)}
            onChange={(next) => console.log('onChange', next)}
        />
    ),
}

export const SlackRowsAndColumns: Story = {
    name: 'Slack rows and columns (Excel-style empty space)',
    parameters: {
        docs: {
            description: {
                story:
                    'Slack rows (controlled by `emptyRows`) and slack columns (`emptyCols`) appear as blank padding below and to the right of the data — exactly like Excel. ' +
                    'Typing into a slack cell **promotes** it to a real row or column automatically: the key is materialised and `onChange` fires with the updated sheet.',
            },
        },
    },
    render: () => (
        <Spreadsheet
            source={[fleet]}
            editable
            emptyRows={20}
            emptyCols={4}
            onChange={(next) => console.log('onChange', next)}
        />
    ),
}

export const SheetManagement: Story = {
    name: 'Sheet management — add, rename, delete tabs',
    parameters: {
        docs: {
            description: {
                story:
                    'When `editable` is true and `allowAddSheet` is not explicitly disabled, a **+** button appears next to the sheet tabs. ' +
                    'New sheets start blank. Click the **×** on a tab to delete it (the last sheet cannot be deleted). ' +
                    'Use the Sheet menu to add 100 rows, 10 columns, or manage sheets from the toolbar.',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const [sheets, setSheets] = useState([fleet, emissions])
            return (
                <div className="flex flex-col gap-3">
                    <Spreadsheet
                        source={sheets}
                        editable
                        onChange={(next) => setSheets(next)}
                    />
                    <p className="text-xs text-foreground-muted">
                        Active sheets: {sheets.map((s) => `"${s.name}"`).join(', ')} — {sheets.reduce((s, sh) => s + sh.rows.length, 0)} total rows.
                    </p>
                </div>
            )
        }
        return <Demo />
    },
}

export const FileOpen: Story = {
    name: 'File ▸ Open (parse an uploaded .xlsx)',
    parameters: {
        docs: {
            description: {
                story:
                    'Click **File → Open…** to pick a local `.xlsx` file. ' +
                    'SheetJS parses it lazily (loaded on first open), so the initial bundle stays lean. ' +
                    'Every worksheet becomes a tab. The existing sheets are replaced.',
            },
        },
    },
    render: () => (
        <Spreadsheet
            source={[fleet]}
            onChange={(next) => console.log('parsed workbook', next)}
        />
    ),
}

export const ExportFormats: Story = {
    name: 'Controlled export formats',
    parameters: {
        docs: {
            description: {
                story:
                    'The `export` prop controls which formats appear in the File → Export submenu. ' +
                    "Pass an array of `'xlsx' | 'csv' | 'pdf'` to restrict, or `false` to hide export entirely. " +
                    'This story shows CSV-only export (no xlsx, no pdf).',
            },
        },
    },
    render: () => <Spreadsheet source={[emissions]} export={['csv']} />,
}

export const CustomDimensions: Story = {
    name: 'Custom height and width',
    parameters: {
        docs: {
            description: {
                story:
                    '`height` and `width` accept a pixel number or any CSS length string. ' +
                    'The grid scrolls internally — the outer container stays exactly the size you specify.',
            },
        },
    },
    render: () => <Spreadsheet source={[fleet]} height={320} width={700} />,
}

export const LargeDataset: Story = {
    name: 'Virtualized — 50,000 rows × 30 columns',
    parameters: {
        docs: {
            description: {
                story:
                    'Both axes are windowed: only the visible rows **and** columns are in the DOM. ' +
                    'Scroll horizontally and vertically — frame rate stays stable regardless of dataset size. ' +
                    'The `virtualize` prop is `true` by default; set it to `false` for small datasets or when you need `position: sticky` on headers.',
            },
        },
    },
    render: () => {
        const VirtualDemo = () => {
            const big = useMemo<SheetData[]>(() => {
                const columns = Array.from({ length: 30 }, (_, i) => ({
                    key: `c${i}`,
                    label: `Col ${i + 1}`,
                    width: 120,
                }))
                const rows = Array.from({ length: 50000 }, (_, r) => {
                    const rec: Record<string, number> = {}
                    columns.forEach((c, i) => { rec[c.key] = r * 30 + i })
                    return rec
                })
                return [{ name: 'Big', columns, rows }]
            }, [])
            return <Spreadsheet source={big} virtualize />
        }
        return <VirtualDemo />
    },
}
