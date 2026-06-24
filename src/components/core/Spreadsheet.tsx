import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
    /** Blank rows kept below the data (the spreadsheet "slack"). Default 50. */
    emptyRows?: number
    /** Blank letter-labelled columns kept to the right of the data. Default 6. */
    emptyCols?: number
    /** Show a “+” to add a blank sheet. Defaults to `editable`. */
    allowAddSheet?: boolean
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

/** Spreadsheet-style column label: 0→A, 25→Z, 26→AA … */
function columnLetter(i: number): string {
    let s = ''
    let n = i
    do { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1 } while (n >= 0)
    return s
}

/** `count` new columns with unique letter keys/labels that don't clash with `existing`. */
function makeColumns(existing: GridColumn[], count: number): GridColumn[] {
    const used = new Set(existing.map((c) => c.key))
    const out: GridColumn[] = []
    let n = existing.length
    for (let k = 0; k < count; k++) {
        let key = columnLetter(n)
        while (used.has(key)) { n++; key = columnLetter(n) }
        used.add(key); out.push({ key, label: key }); n++
    }
    return out
}

/** A fresh empty sheet with lettered columns (used by the “+” add-sheet button). */
function blankSheet(name: string, cols = 8): SheetData {
    return { name, columns: makeColumns([], cols), rows: [] }
}

/** Parse a SheetJS workbook (bytes already read) into our SheetData[] shape. */
function parseWorkbook(XLSX: any, bytes: Uint8Array): SheetData[] {
    const wb = XLSX.read(bytes, { type: 'array' })
    return wb.SheetNames.map((name: string) => {
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
    emptyRows = 50,
    emptyCols = 6,
    allowAddSheet,
    height = 480,
    width,
    className = '',
    style,
}: SpreadsheetProps) {
    const canAddSheet = allowAddSheet ?? editable
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
                const parsed = parseWorkbook(XLSX, bytes)
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
            // Editing into the blank slack appends rows up to that index.
            while (target.rows.length <= row) target.rows.push({})
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

    const addSheet = useCallback(() => {
        setSheets((prev) => {
            const list = prev ?? []
            const used = new Set(list.map((s) => s.name))
            let n = list.length + 1
            while (used.has(`Sheet ${n}`)) n++
            const next = [...list, blankSheet(`Sheet ${n}`)]
            setActive(next.length - 1)
            onChange?.(next)
            return next
        })
    }, [onChange])

    const deleteSheet = useCallback((index: number) => {
        if (!sheets || sheets.length <= 1) return // a workbook keeps at least one sheet
        const next = sheets.filter((_, i) => i !== index)
        setSheets(next)
        setActive((a) => Math.max(0, Math.min(index < a ? a - 1 : a, next.length - 1)))
        onChange?.(next)
    }, [sheets, onChange])

    const add100Rows = useCallback(() => {
        setSheets((prev) => {
            if (!prev) return prev
            const next = prev.map((s, i) => (i === active ? { ...s, rows: [...s.rows, ...Array.from({ length: 100 }, () => ({})) ] } : s))
            onChange?.(next)
            return next
        })
    }, [active, onChange])

    const add10Columns = useCallback(() => {
        setSheets((prev) => {
            if (!prev) return prev
            const next = prev.map((s, i) => {
                if (i !== active) return s
                const cols = toColumns(s.columns)
                return { ...s, columns: [...cols, ...makeColumns(cols, 10)] }
            })
            onChange?.(next)
            return next
        })
    }, [active, onChange])

    const insertColumn = useCallback((index: number) => {
        setSheets((prev) => {
            if (!prev) return prev
            const next = prev.map((s, i) => {
                if (i !== active) return s
                const cols = toColumns(s.columns)
                const at = Math.max(0, Math.min(index, cols.length))
                const out = [...cols]
                out.splice(at, 0, makeColumns(cols, 1)[0])
                return { ...s, columns: out }
            })
            onChange?.(next)
            return next
        })
    }, [active, onChange])

    const insertRow = useCallback((index: number) => {
        setSheets((prev) => {
            if (!prev) return prev
            const next = prev.map((s, i) => {
                if (i !== active) return s
                const rows = [...s.rows]
                rows.splice(Math.max(0, Math.min(index, rows.length)), 0, {})
                return { ...s, rows }
            })
            onChange?.(next)
            return next
        })
    }, [active, onChange])

    const deleteRow = useCallback((index: number) => {
        setSheets((prev) => {
            if (!prev) return prev
            const next = prev.map((s, i) => (i === active && index < s.rows.length ? { ...s, rows: s.rows.filter((_, r) => r !== index) } : s))
            onChange?.(next)
            return next
        })
    }, [active, onChange])

    // ── Open a local .xlsx/.csv via the OS file picker (File ▸ Open) ───────────
    const fileInputRef = useRef<HTMLInputElement>(null)
    const openFile = () => fileInputRef.current?.click()
    const onFilePicked = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = '' // allow re-picking the same file
        if (!file) return
        setStatus('loading'); setError(null)
        try {
            const bytes = new Uint8Array(await file.arrayBuffer())
            const XLSX = await loadXlsx()
            const parsed = parseWorkbook(XLSX, bytes)
            setSheets(parsed); setActive(0); setStatus('ready'); onChange?.(parsed)
        } catch (err) {
            setError(err as Error); setStatus('error')
        }
    }, [onChange])

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
        xlsx: 'Excel (.xlsx)',
        csv: 'CSV (.csv)',
        pdf: 'PDF (.pdf)',
    }

    // Excel-style menu bar. File → Open / Export▸; Sheet → add / delete / rows.
    const fileItems = [
        { key: 'open', label: 'Open', onSelect: openFile },
        ...(formats.length > 0
            ? [{ key: 'export', label: 'Export', separatorBefore: true, children: formats.map((fmt) => ({ key: fmt, label: exportLabels[fmt], onSelect: () => runExport(fmt) })) }]
            : []),
    ]
    const sheetItems = [
        { key: 'add', label: 'Add Sheet', onSelect: addSheet },
        { key: 'delete', label: 'Delete Sheet', danger: true, disabled: sheets.length <= 1, onSelect: () => deleteSheet(active) },
        { key: 'add100', label: 'Add 100 rows', separatorBefore: true, onSelect: add100Rows },
        { key: 'add10cols', label: 'Add 10 columns', onSelect: add10Columns },
    ]
    const canDeleteSheet = editable && sheets.length > 1

    return (
        <div className={cx('flex flex-col overflow-hidden rounded-lg border border-border bg-surface-raised', className)} style={{ height, width, ...style }}>
            {/* Menu bar — File / Sheet menus, like a spreadsheet app. */}
            <div className="flex flex-shrink-0 items-center gap-0.5 border-b border-border bg-surface px-1.5 py-1">
                <MenuButton label="File" variant="ghost" size="sm" hideChevron items={fileItems} />
                {editable && <MenuButton label="Sheet" variant="ghost" size="sm" hideChevron items={sheetItems} />}
            </div>

            {/* Hidden picker backing File ▸ Open. */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={onFilePicked}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
            />

            {/* Grid fills the space between the toolbar and the sheet tabs. */}
            <div className="min-h-0 flex-1">
                <DataGrid
                    key={active}
                    columns={columns}
                    rows={plainRows}
                    editable={editable}
                    sortable={sortable}
                    virtualize={virtualize}
                    trailingRows={emptyRows}
                    trailingCols={emptyCols}
                    contextMenu
                    onInsertRow={editable ? insertRow : undefined}
                    onDeleteRow={editable ? deleteRow : undefined}
                    onInsertColumn={editable ? insertColumn : undefined}
                    onCellEdit={handleCellEdit}
                    height="100%"
                    className="!rounded-none !border-0"
                />
            </div>

            {/* Status bar: sheet tabs (with add / delete) on the left, row·col meta on the right. */}
            <div className="flex flex-shrink-0 items-center gap-2 border-t border-border bg-surface px-2 py-1">
                <div role="tablist" aria-label="Sheets" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
                    {sheets.map((s, i) => {
                        const activeTab = i === active
                        const name = s.name || `Sheet ${i + 1}`
                        return (
                            <div
                                key={`${s.name}-${i}`}
                                role="tab"
                                tabIndex={0}
                                aria-selected={activeTab}
                                onClick={() => setActive(i)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(i) } }}
                                className={cx(
                                    'group flex flex-shrink-0 cursor-pointer items-center gap-1 rounded-t-md border-t-2 px-3 py-1 text-xs transition-colors',
                                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                                    activeTab
                                        ? 'border-t-accent bg-surface-raised font-semibold text-foreground shadow-sm'
                                        : 'border-t-transparent font-medium text-foreground-secondary hover:bg-surface-raised hover:text-foreground',
                                )}
                            >
                                <span className="max-w-[160px] truncate">{name}</span>
                                {canDeleteSheet && (
                                    <button
                                        type="button"
                                        title="Delete sheet"
                                        aria-label={`Delete ${name}`}
                                        onClick={(e) => { e.stopPropagation(); deleteSheet(i) }}
                                        className={cx(
                                            'flex h-4 w-4 items-center justify-center rounded text-foreground-muted transition-opacity hover:text-status-error',
                                            activeTab ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                                        )}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3" aria-hidden="true">
                                            <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )
                    })}
                    {canAddSheet && (
                        <button
                            type="button"
                            onClick={addSheet}
                            title="Add sheet"
                            aria-label="Add sheet"
                            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-raised hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                            </svg>
                        </button>
                    )}
                </div>

                <span className="hidden flex-shrink-0 text-xs tabular-nums text-foreground-muted sm:inline">
                    {plainRows.length.toLocaleString()} {plainRows.length === 1 ? 'row' : 'rows'} · {columns.length} cols
                </span>
            </div>
        </div>
    )
}
