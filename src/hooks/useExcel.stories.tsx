import React, { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useExcel } from './useExcel'
import type { ParsedSheet } from './useExcel'
import Button from '../components/inputs/Button'

const meta: Meta = {
    title: 'Hooks/useExcel',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

// ── Shared fixtures ───────────────────────────────────────────────────────────

const FLEET_SHEET = {
    name: 'Fleet',
    columns: ['Vessel', 'IMO', 'Type', 'DWT (t)', 'CII'],
    rows: [
        { Vessel: 'MV Aurora', IMO: 9876543, 'Type': 'Bulk Carrier', 'DWT (t)': 81200, CII: 'B' },
        { Vessel: 'MV Borealis', IMO: 9123456, 'Type': 'Tanker', 'DWT (t)': 115000, CII: 'C' },
        { Vessel: 'MV Calypso', IMO: 9234567, 'Type': 'Container', 'DWT (t)': 64000, CII: 'A' },
        { Vessel: 'MV Dorado', IMO: 9345678, 'Type': 'Bulk Carrier', 'DWT (t)': 93400, CII: 'D' },
        { Vessel: 'MV Eos', IMO: 9456789, 'Type': 'Tanker', 'DWT (t)': 72100, CII: 'B' },
    ],
}

const EMISSIONS_SHEET = {
    name: 'Emissions',
    columns: ['Month', 'CO2 (t)', 'Fuel (t)', 'Distance (nm)'],
    rows: [
        { Month: 'Jan 2024', 'CO2 (t)': 1240, 'Fuel (t)': 396, 'Distance (nm)': 8200 },
        { Month: 'Feb 2024', 'CO2 (t)': 1180, 'Fuel (t)': 377, 'Distance (nm)': 7900 },
        { Month: 'Mar 2024', 'CO2 (t)': 1320, 'Fuel (t)': 421, 'Distance (nm)': 8600 },
        { Month: 'Apr 2024', 'CO2 (t)': 1095, 'Fuel (t)': 350, 'Distance (nm)': 7200 },
        { Month: 'May 2024', 'CO2 (t)': 1410, 'Fuel (t)': 450, 'Distance (nm)': 9100 },
    ],
}

// ── exportSheets — single sheet ───────────────────────────────────────────────

export const ExportSingleSheet: Story = {
    name: 'exportSheets — single sheet',
    parameters: {
        docs: {
            description: {
                story:
                    'Builds a `.xlsx` workbook from an array of `ExcelSheetInput` objects and triggers a browser download. ' +
                    'Columns can be passed as an explicit `string[]` (used for the header row and for mapping object rows) ' +
                    'or omitted — the hook infers them from the union of all row-object keys.',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { exportSheets, isExporting } = useExcel()

            return (
                <div className="flex flex-col items-center gap-6" style={{ width: 360 }}>
                    <div className="w-full rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">Fleet register → fleet.xlsx</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            Object rows, explicit column order, bold header, auto-sized columns (capped at 40 chars).
                        </p>
                    </div>
                    <Button
                        content={isExporting ? 'Building…' : 'Download fleet.xlsx'}
                        disabled={isExporting}
                        onClick={() => exportSheets([FLEET_SHEET], { fileName: 'fleet' })}
                    />
                </div>
            )
        }
        return <Demo />
    },
}

// ── exportSheets — multi-sheet ────────────────────────────────────────────────

export const ExportMultiSheet: Story = {
    name: 'exportSheets — multiple worksheets',
    parameters: {
        docs: {
            description: {
                story:
                    'Each entry in the `sheets` array becomes a named worksheet. ' +
                    'Worksheet names are sanitised automatically (≤ 31 chars, restricted characters replaced).',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { exportSheets, isExporting } = useExcel()

            return (
                <div className="flex flex-col items-center gap-6" style={{ width: 360 }}>
                    <div className="w-full rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">Fleet + Emissions → report.xlsx</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            Two worksheets in one file. Each sheet gets its own header row and column widths.
                        </p>
                    </div>
                    <Button
                        content={isExporting ? 'Building…' : 'Download report.xlsx (2 sheets)'}
                        disabled={isExporting}
                        onClick={() => exportSheets([FLEET_SHEET, EMISSIONS_SHEET], { fileName: 'report' })}
                    />
                </div>
            )
        }
        return <Demo />
    },
}

// ── exportSheets — array rows ─────────────────────────────────────────────────

export const ExportArrayRows: Story = {
    name: 'exportSheets — positional array rows',
    parameters: {
        docs: {
            description: {
                story:
                    'Rows can be plain `CellValue[]` arrays instead of key-value objects. ' +
                    'In this form `columns` is an explicit header that labels each positional index. ' +
                    'Array rows and object rows can be mixed within the same sheet.',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { exportSheets, isExporting } = useExcel()

            const sheet = {
                name: 'Cargo',
                columns: ['Port', 'Cargo (t)', 'ETD'],
                rows: [
                    ['Rotterdam', 42000, '2024-03-12'],
                    ['Singapore', 38500, '2024-03-28'],
                    ['Houston', 51000, '2024-04-05'],
                ] as [string, number, string][],
            }

            return (
                <div className="flex flex-col items-center gap-6" style={{ width: 360 }}>
                    <div className="w-full rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">Array rows (no key mapping needed)</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            Each row is a <code>CellValue[]</code>. The <code>columns</code> array provides the header labels.
                        </p>
                    </div>
                    <Button
                        content={isExporting ? 'Building…' : 'Download cargo.xlsx'}
                        disabled={isExporting}
                        onClick={() => exportSheets([sheet], { fileName: 'cargo' })}
                    />
                </div>
            )
        }
        return <Demo />
    },
}

// ── onSave callback ───────────────────────────────────────────────────────────

export const OnSaveCallback: Story = {
    name: 'exportSheets — onSave (receive the Blob)',
    parameters: {
        docs: {
            description: {
                story:
                    'Pass `onSave` to intercept the finished Blob instead of triggering a browser download. ' +
                    'Useful for uploading to a server, passing to another hook, or inspecting the bytes.',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { exportSheets, isExporting } = useExcel()
            const [info, setInfo] = useState<string | null>(null)

            const handleExport = async () => {
                await exportSheets([FLEET_SHEET], {
                    fileName: 'fleet',
                    onSave: async (blob, name) => {
                        setInfo(`onSave received: "${name}" — ${blob.size.toLocaleString()} bytes, type: ${blob.type}`)
                        // In a real app: await fetch('/api/upload', { method: 'POST', body: blob })
                    },
                })
            }

            return (
                <div className="flex flex-col items-center gap-4" style={{ width: 400 }}>
                    <div className="w-full rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">onSave intercepts the Blob</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            No download is triggered. The Blob is handed to your callback instead.
                        </p>
                    </div>
                    <Button
                        content={isExporting ? 'Building…' : 'Build without downloading'}
                        disabled={isExporting}
                        onClick={handleExport}
                    />
                    {info && (
                        <div className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs text-foreground">
                            {info}
                        </div>
                    )}
                </div>
            )
        }
        return <Demo />
    },
}

// ── readWorkbook ──────────────────────────────────────────────────────────────

export const ReadWorkbook: Story = {
    name: 'readWorkbook — parse an uploaded .xlsx',
    parameters: {
        docs: {
            description: {
                story:
                    'Parses a `File`, `Blob`, `ArrayBuffer`, or `Uint8Array`. ' +
                    'Returns one `ParsedSheet` per worksheet: the first row becomes the header keys, ' +
                    'all remaining rows are mapped to `Record<header, CellValue>`.',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { readWorkbook } = useExcel()
            const [sheets, setSheets] = useState<ParsedSheet[] | null>(null)
            const [loading, setLoading] = useState(false)
            const inputRef = useRef<HTMLInputElement>(null)

            const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                setLoading(true)
                try {
                    const parsed = await readWorkbook(file)
                    setSheets(parsed)
                } finally {
                    setLoading(false)
                }
            }

            return (
                <div className="flex flex-col gap-4" style={{ width: 480 }}>
                    <div className="rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">readWorkbook(file)</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            Pick any <code>.xlsx</code> file — each worksheet is parsed into header-keyed rows.
                        </p>
                    </div>
                    <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={handleFile} />
                    <Button
                        content={loading ? 'Parsing…' : 'Open .xlsx file…'}
                        disabled={loading}
                        onClick={() => inputRef.current?.click()}
                    />
                    {sheets && (
                        <div className="flex flex-col gap-3">
                            {sheets.map((sheet) => (
                                <div key={sheet.name} className="rounded-lg border border-border bg-surface overflow-hidden">
                                    <div className="border-b border-border bg-surface-raised px-3 py-2 text-xs font-semibold text-foreground">
                                        {sheet.name} — {sheet.rows.length} rows
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    {Object.keys(sheet.rows[0] ?? {}).slice(0, 6).map((h) => (
                                                        <th key={h} className="px-2 py-1.5 text-left font-medium text-foreground-muted">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sheet.rows.slice(0, 5).map((row, i) => (
                                                    <tr key={i} className="border-b border-border last:border-0">
                                                        {Object.values(row).slice(0, 6).map((v, ci) => (
                                                            <td key={ci} className="px-2 py-1.5 text-foreground">{v == null ? '' : String(v)}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {sheet.rows.length > 5 && (
                                        <p className="px-3 py-1.5 text-xs text-foreground-muted">… and {sheet.rows.length - 5} more rows</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }
        return <Demo />
    },
}

// ── Round-trip ────────────────────────────────────────────────────────────────

export const RoundTrip: Story = {
    name: 'Round-trip — export then re-import',
    parameters: {
        docs: {
            description: {
                story:
                    'Exports a workbook in memory (via `onSave`), then immediately re-parses it with `readWorkbook`. ' +
                    'Demonstrates that the export and parse steps compose cleanly — useful for testing pipelines that generate and consume xlsx.',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { exportSheets, readWorkbook } = useExcel()
            const [result, setResult] = useState<ParsedSheet | null>(null)
            const [busy, setBusy] = useState(false)

            const run = async () => {
                setBusy(true)
                setResult(null)
                try {
                    let capturedBlob: Blob | null = null
                    await exportSheets([FLEET_SHEET], {
                        onSave: async (blob) => { capturedBlob = blob },
                    })
                    if (capturedBlob) {
                        const parsed = await readWorkbook(capturedBlob)
                        setResult(parsed[0] ?? null)
                    }
                } finally {
                    setBusy(false)
                }
            }

            return (
                <div className="flex flex-col gap-4" style={{ width: 480 }}>
                    <div className="rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">exportSheets → Blob → readWorkbook</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            The Blob is kept in memory. No download is triggered.
                        </p>
                    </div>
                    <Button content={busy ? 'Running…' : 'Export → re-parse'} disabled={busy} onClick={run} />
                    {result && (
                        <div className="rounded-lg border border-border bg-surface overflow-hidden">
                            <div className="border-b border-border bg-surface-raised px-3 py-2 text-xs font-semibold text-foreground">
                                Parsed: "{result.name}" — {result.rows.length} rows
                            </div>
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-border">
                                        {Object.keys(result.rows[0] ?? {}).map((h) => (
                                            <th key={h} className="px-2 py-1.5 text-left font-medium text-foreground-muted">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.rows.map((row, i) => (
                                        <tr key={i} className="border-b border-border last:border-0">
                                            {Object.values(row).map((v, ci) => (
                                                <td key={ci} className="px-2 py-1.5 text-foreground">{v == null ? '' : String(v)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )
        }
        return <Demo />
    },
}
