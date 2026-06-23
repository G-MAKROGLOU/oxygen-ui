import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataGrid, { type GridColumn, type CellValue } from './DataGrid'
import Button from '../inputs/Button'
import { SkeletonBox } from './Skeleton'
import { cx } from '../../utils/cx'
import { type RemoteSourceOptions, sourceToBytes, sourceName } from '../../utils/fileSource'

export interface Cell {
    value: CellValue
    /** Reserved for a future formula engine — parsed/stored but not evaluated. */
    formula?: string
}

export interface SheetData {
    name: string
    columns: GridColumn[] | string[]
    rows: Array<Record<string, Cell | CellValue>>
}

export type GridSource = SheetData[] | File | Blob | string | URL

export interface SpreadsheetProps {
    source: GridSource
    remote?: RemoteSourceOptions
    /** Value editing only — no formulas. Default false. */
    editable?: boolean
    onCellEdit?: (e: { sheet: string; row: number; column: string; value: unknown }) => void
    onChange?: (sheets: SheetData[]) => void
    /** Export formats offered in the toolbar. Default `['xlsx','csv','pdf']`; `false` hides export. */
    export?: Array<'xlsx' | 'csv' | 'pdf'> | false
    fileName?: string
    /** Default true. */
    virtualize?: boolean
    // formulaEngine?: FormulaEngineAdapter // RESERVED FOR FUTURE — design seam only.
    className?: string
    style?: React.CSSProperties
}

// ── Normalisation helpers ─────────────────────────────────────────────────────
function toColumns(cols: GridColumn[] | string[]): GridColumn[] {
    return cols.map((c) => (typeof c === 'string' ? { key: c, label: c } : { ...c, label: c.label ?? c.key }))
}

function cellValue(v: Cell | CellValue): CellValue {
    if (v != null && typeof v === 'object' && 'value' in v) return (v as Cell).value
    return v as CellValue
}

function toPlainRows(sheet: SheetData, columns: GridColumn[]): Array<Record<string, CellValue>> {
    return sheet.rows.map((row) => {
        const out: Record<string, CellValue> = {}
        for (const c of columns) out[c.key] = cellValue(row[c.key])
        return out
    })
}

// ── Lazy heavy deps ────────────────────────────────────────────────────────────
let xlsxPromise: Promise<any> | null = null
const loadXlsx = () => (xlsxPromise ??= import('xlsx'))
let jspdfPromise: Promise<any> | null = null
const loadJspdf = () => (jspdfPromise ??= import('jspdf'))

function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Multi-sheet spreadsheet built on {@link DataGrid}. Accepts data three ways
 * — in-memory `SheetData[]` (no network), a `File`/`Blob` (no network), or a
 * URL (the only mode that fetches). `.xlsx` is parsed with SheetJS, loaded
 * lazily on first use. Value editing emits `onCellEdit` + `onChange`; there is
 * no formula engine (the `Cell.formula` slot is reserved, not evaluated).
 * Exports to multi-sheet `.xlsx`, `.csv` (active sheet, BOM-prefixed) or a
 * paginated table `.pdf` (jsPDF, lazy).
 */
export default function Spreadsheet({
    source,
    remote,
    editable = false,
    onCellEdit,
    onChange,
    export: exportFormats = ['xlsx', 'csv', 'pdf'],
    fileName,
    virtualize = true,
    className = '',
    style,
}: SpreadsheetProps) {
    const [sheets, setSheets] = useState<SheetData[] | null>(Array.isArray(source) ? source : null)
    const [active, setActive] = useState(0)
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(Array.isArray(source) ? 'ready' : 'loading')
    const [error, setError] = useState<Error | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    // ── Resolve source → sheets ───────────────────────────────────────────────
    useEffect(() => {
        if (Array.isArray(source)) { setSheets(source); setStatus('ready'); return }
        let cancelled = false
        setStatus('loading'); setError(null)
        ;(async () => {
            try {
                const bytes = await sourceToBytes(source, remote)
                const XLSX = await loadXlsx()
                const wb = XLSX.read(bytes, { type: 'array' })
                const parsed: SheetData[] = wb.SheetNames.map((name: string) => {
                    const ws = wb.Sheets[name]
                    const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: null })
                    const headerRow = aoa[0] ?? []
                    const columns: GridColumn[] = headerRow.map((h: any, i: number) => ({
                        key: h != null && String(h).length ? String(h) : `col_${i}`,
                        label: h != null && String(h).length ? String(h) : `Column ${i + 1}`,
                    }))
                    const rows = aoa.slice(1).map((r) => {
                        const rec: Record<string, CellValue> = {}
                        columns.forEach((c, i) => { rec[c.key] = (r[i] ?? null) as CellValue })
                        return rec
                    })
                    return { name, columns, rows }
                })
                if (cancelled) return
                setSheets(parsed); setActive(0); setStatus('ready')
            } catch (err) {
                if (cancelled) return
                setError(err as Error); setStatus('error')
            }
        })()
        return () => { cancelled = true }
    }, [source, remote, reloadKey])

    const sheet = sheets?.[active]
    const columns = useMemo(() => (sheet ? toColumns(sheet.columns) : []), [sheet])
    const plainRows = useMemo(() => (sheet ? toPlainRows(sheet, columns) : []), [sheet, columns])

    // ── Editing ───────────────────────────────────────────────────────────────
    const handleCellEdit = useCallback(({ row, column, value }: { row: number; column: string; value: string }) => {
        setSheets((prev) => {
            if (!prev) return prev
            const next = prev.map((s, i) => (i === active ? { ...s, rows: s.rows.map((r) => ({ ...r })) } : s))
            const target = next[active]
            const existing = target.rows[row]?.[column]
            // Preserve the Cell/formula shape if the original used it.
            if (existing != null && typeof existing === 'object' && 'value' in existing) {
                target.rows[row][column] = { ...(existing as Cell), value }
            } else {
                target.rows[row][column] = value
            }
            onChange?.(next)
            return next
        })
        onCellEdit?.({ sheet: sheets?.[active]?.name ?? '', row, column, value })
    }, [active, onCellEdit, onChange, sheets])

    // ── Exports ───────────────────────────────────────────────────────────────
    const baseName = useMemo(
        () => (fileName || (typeof source === 'object' && 'name' in (source as any) ? sourceName(source as any) : null) || 'spreadsheet').replace(/\.[^.]+$/, ''),
        [fileName, source],
    )

    const sheetAoa = useCallback((s: SheetData) => {
        const cols = toColumns(s.columns)
        const header = cols.map((c) => (typeof c.label === 'string' ? c.label : c.key))
        const body = s.rows.map((r) => cols.map((c) => cellValue(r[c.key])))
        return [header, ...body]
    }, [])

    const exportXlsx = useCallback(async () => {
        if (!sheets) return
        const XLSX = await loadXlsx()
        const wb = XLSX.utils.book_new()
        sheets.forEach((s) => {
            const ws = XLSX.utils.aoa_to_sheet(sheetAoa(s))
            XLSX.utils.book_append_sheet(wb, ws, (s.name || 'Sheet').slice(0, 31))
        })
        const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        download(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${baseName}.xlsx`)
    }, [sheets, sheetAoa, baseName])

    const exportCsv = useCallback(() => {
        if (!sheet) return
        const aoa = sheetAoa(sheet)
        const esc = (v: CellValue) => {
            const s = v == null ? '' : String(v)
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        }
        const csv = aoa.map((row) => row.map(esc).join(',')).join('\r\n')
        download(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }), `${baseName}.csv`)
    }, [sheet, sheetAoa, baseName])

    const exportPdf = useCallback(async () => {
        if (!sheet) return
        const { jsPDF } = await loadJspdf()
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
        const aoa = sheetAoa(sheet)
        const margin = 32
        const pageW = doc.internal.pageSize.getWidth()
        const pageH = doc.internal.pageSize.getHeight()
        const cols = aoa[0]?.length || 1
        const colW = (pageW - margin * 2) / cols
        const rowH = 18
        let y = margin
        doc.setFontSize(9)
        const drawRow = (row: any[], header: boolean) => {
            if (y + rowH > pageH - margin) { doc.addPage(); y = margin }
            doc.setFont('helvetica', header ? 'bold' : 'normal')
            row.forEach((cell, i) => {
                const text = cell == null ? '' : String(cell)
                doc.text(text.length > 24 ? `${text.slice(0, 23)}…` : text, margin + i * colW + 2, y + 12)
            })
            doc.setDrawColor(210)
            doc.line(margin, y + rowH, pageW - margin, y + rowH)
            y += rowH
        }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text(sheet.name || baseName, margin, y); y += 22
        doc.setFontSize(9)
        aoa.forEach((row, i) => drawRow(row, i === 0))
        doc.save(`${baseName}.pdf`)
    }, [sheet, sheetAoa, baseName])

    const runExport = (fmt: 'xlsx' | 'csv' | 'pdf') => {
        if (fmt === 'xlsx') void exportXlsx()
        else if (fmt === 'csv') exportCsv()
        else void exportPdf()
    }

    // ── States ───────────────────────────────────────────────────────────────
    if (status === 'error') {
        return (
            <div className={cx('flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-8 text-center', className)} style={style}>
                <p className="text-sm font-medium text-status-error">Couldn’t load the spreadsheet</p>
                {error?.message && <p className="max-w-md text-xs text-foreground-muted">{error.message}</p>}
                <Button content="Retry" size="sm" variant="outline" onClick={() => setReloadKey((k) => k + 1)} />
            </div>
        )
    }

    if (status === 'loading' || !sheets) {
        return (
            <div className={cx('rounded-lg border border-border bg-surface-raised p-4', className)} style={style}>
                <SkeletonBox height={32} className="mb-3 rounded" />
                <SkeletonBox height={360} className="rounded" />
            </div>
        )
    }

    const formats = exportFormats || []

    return (
        <div className={cx('flex flex-col gap-2', className)} style={style}>
            {(sheets.length > 1 || formats.length > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                    {sheets.length > 1 && (
                        <div role="tablist" className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-surface p-1">
                            {sheets.map((s, i) => (
                                <button
                                    key={`${s.name}-${i}`}
                                    role="tab"
                                    type="button"
                                    aria-selected={i === active}
                                    onClick={() => setActive(i)}
                                    className={cx(
                                        'rounded-md px-3 py-1 text-sm transition-colors',
                                        i === active ? 'bg-accent text-accent-fg' : 'text-foreground-secondary hover:bg-surface-raised hover:text-foreground',
                                    )}
                                >
                                    {s.name || `Sheet ${i + 1}`}
                                </button>
                            ))}
                        </div>
                    )}
                    {formats.length > 0 && (
                        <div className="ml-auto flex items-center gap-1.5">
                            {formats.map((fmt) => (
                                <Button key={fmt} content={fmt.toUpperCase()} size="sm" variant="outline" onClick={() => runExport(fmt)} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <DataGrid
                columns={columns}
                rows={plainRows}
                editable={editable}
                virtualize={virtualize}
                onCellEdit={handleCellEdit}
            />
        </div>
    )
}
