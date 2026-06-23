import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataGrid, { type GridColumn, type CellValue } from './DataGrid'
import Button from '../inputs/Button'
import MenuButton from './MenuButton'
import { SkeletonBox } from './Skeleton'
import { cx } from '../../utils/cx'
import { type RemoteSourceOptions, sourceToBytes, sourceName, downloadBlob } from '../../utils/fileSource'

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
    /** Click column headers to sort. Default true. */
    sortable?: boolean
    /** Overall height. Default 480. */
    height?: number | string
    /** Overall width. Defaults to filling the container. */
    width?: number | string
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

// Keep the edited value in the same primitive type as the cell it replaces, so
// a number column round-trips to xlsx as a number (not text) after editing.
function coerceToCellType(prev: CellValue, next: string): CellValue {
    if (typeof prev === 'number') {
        const n = Number(next)
        return next.trim() !== '' && Number.isFinite(n) ? n : next
    }
    if (typeof prev === 'boolean') {
        if (/^(true|false)$/i.test(next.trim())) return next.trim().toLowerCase() === 'true'
        return next
    }
    return next
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
    sortable = true,
    height = 480,
    width,
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
        let coerced: CellValue = value
        setSheets((prev) => {
            if (!prev) return prev
            const next = prev.map((s, i) => (i === active ? { ...s, rows: s.rows.map((r) => ({ ...r })) } : s))
            const target = next[active]
            const existing = target.rows[row]?.[column]
            const prevValue = cellValue(existing as Cell | CellValue)
            coerced = coerceToCellType(prevValue, value)
            // Preserve the Cell/formula shape if the original used it.
            if (existing != null && typeof existing === 'object' && 'value' in existing) {
                target.rows[row][column] = { ...(existing as Cell), value: coerced }
            } else {
                target.rows[row][column] = coerced
            }
            onChange?.(next)
            return next
        })
        onCellEdit?.({ sheet: sheets?.[active]?.name ?? '', row, column, value: coerced })
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
        downloadBlob(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${baseName}.xlsx`)
    }, [sheets, sheetAoa, baseName])

    const exportCsv = useCallback(() => {
        if (!sheet) return
        const aoa = sheetAoa(sheet)
        const esc = (v: CellValue) => {
            const s = v == null ? '' : String(v)
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        }
        const csv = aoa.map((row) => row.map(esc).join(',')).join('\r\n')
        downloadBlob(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }), `${baseName}.csv`)
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
            <div className={cx('flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-8 text-center', className)} style={{ height, width, ...style }}>
                <p className="text-sm font-medium text-status-error">Couldn’t load the spreadsheet</p>
                {error?.message && <p className="max-w-md text-xs text-foreground-muted">{error.message}</p>}
                <Button content="Retry" size="sm" variant="outline" onClick={() => setReloadKey((k) => k + 1)} />
            </div>
        )
    }

    if (status === 'loading' || !sheets) {
        return (
            <div className={cx('overflow-hidden rounded-lg border border-border bg-surface-raised p-4', className)} style={{ height, width, ...style }}>
                <SkeletonBox height={32} className="mb-3 rounded" />
                <SkeletonBox height="calc(100% - 44px)" className="rounded" />
            </div>
        )
    }

    const formats = exportFormats || []
    const exportLabels: Record<'xlsx' | 'csv' | 'pdf', string> = {
        xlsx: 'Excel workbook (.xlsx)',
        csv: 'CSV — this sheet (.csv)',
        pdf: 'PDF table (.pdf)',
    }

    return (
        <div className={cx('flex flex-col overflow-hidden rounded-lg border border-border bg-surface-raised', className)} style={{ height, width, ...style }}>
            {/* Top toolbar: active sheet name + row/col meta + export menu. */}
            <div className="flex flex-shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-1.5">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{sheet?.name || 'Sheet 1'}</span>

                <span className="hidden flex-shrink-0 text-xs tabular-nums text-foreground-muted sm:inline">
                    {plainRows.length.toLocaleString()} {plainRows.length === 1 ? 'row' : 'rows'} · {columns.length} cols
                </span>

                {formats.length > 0 && (
                    <>
                        <span className="h-5 w-px flex-shrink-0 bg-border" aria-hidden="true" />
                        <MenuButton
                            label="Export"
                            size="sm"
                            variant="outline"
                            align="end"
                            icon={<DownloadIcon />}
                            items={formats.map((fmt) => ({
                                key: fmt,
                                label: exportLabels[fmt],
                                onSelect: () => runExport(fmt),
                            }))}
                        />
                    </>
                )}
            </div>

            {/* Grid fills the space between the toolbar and the sheet tabs. */}
            <div className="min-h-0 flex-1">
                <DataGrid
                    key={active}
                    columns={columns}
                    rows={plainRows}
                    editable={editable}
                    sortable={sortable}
                    virtualize={virtualize}
                    onCellEdit={handleCellEdit}
                    height="100%"
                    className="!rounded-none !border-0"
                />
            </div>

            {/* Bottom sheet tabs — Excel-style, on their own bar. */}
            {sheets.length > 1 && (
                <div role="tablist" aria-label="Sheets" className="flex flex-shrink-0 items-center gap-1 overflow-x-auto border-t border-border bg-surface px-2 py-1">
                    {sheets.map((s, i) => (
                        <button
                            key={`${s.name}-${i}`}
                            role="tab"
                            type="button"
                            aria-selected={i === active}
                            onClick={() => setActive(i)}
                            className={cx(
                                'flex-shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                                i === active
                                    ? 'bg-surface-raised text-foreground shadow-sm'
                                    : 'text-foreground-secondary hover:bg-surface-raised hover:text-foreground',
                            )}
                        >
                            {s.name || `Sheet ${i + 1}`}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />
    </svg>
)
