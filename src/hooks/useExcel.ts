import { useState, useCallback } from 'react'
import type { CellValue } from '../components/core/DataGrid'
import { useDownload } from './useDownload'

export interface ExportSaveOptions {
    /** File name WITHOUT extension. Default: 'export' (Excel) / 'report' (PDF). */
    fileName?: string
    /** Receive the finished Blob instead of triggering a browser download. */
    onSave?: (blob: Blob, fileName: string) => void | Promise<void>
}

export interface ExcelSheetInput {
    name: string
    /** Explicit header row. Omit to derive from row-object keys. */
    columns?: string[]
    rows: Array<CellValue[] | Record<string, CellValue>>
}

export interface ParsedSheet {
    name: string
    rows: Record<string, CellValue>[]
}

export interface UseExcelReturn {
    exportSheets: (sheets: ExcelSheetInput[], options?: ExportSaveOptions) => Promise<void>
    readWorkbook: (source: File | Blob | ArrayBuffer | Uint8Array) => Promise<ParsedSheet[]>
    isExporting: boolean
}

// Excel worksheet name: max 31 chars, restricted chars: : \ / ? * [ ]
const INVALID_WS_CHARS = /[:\\/?\*[\]]/g
function sanitizeName(name: string): string {
    return name.replace(INVALID_WS_CHARS, '_').slice(0, 31) || 'Sheet'
}

let xlsxPromise: Promise<any> | null = null
const loadXlsx = () => (xlsxPromise ??= import('xlsx'))

export function useExcel(): UseExcelReturn {
    const [isExporting, setIsExporting] = useState(false)
    const { saveBlob } = useDownload()

    const exportSheets = useCallback(async (sheets: ExcelSheetInput[], options: ExportSaveOptions = {}) => {
        const { fileName = 'export', onSave } = options
        setIsExporting(true)
        try {
            const XLSX = await loadXlsx()
            const wb = XLSX.utils.book_new()

            for (const sheet of sheets) {
                // Derive headers: explicit columns > object-row keys
                let headers: string[]
                if (sheet.columns) {
                    headers = sheet.columns
                } else {
                    const seen = new Set<string>()
                    for (const row of sheet.rows) {
                        if (!Array.isArray(row)) {
                            for (const k of Object.keys(row)) seen.add(k)
                        }
                    }
                    headers = Array.from(seen)
                }

                const aoa: CellValue[][] = []
                if (headers.length > 0) aoa.push(headers)

                for (const row of sheet.rows) {
                    if (Array.isArray(row)) {
                        aoa.push(row)
                    } else {
                        aoa.push(headers.map((h) => (row[h] ?? null) as CellValue))
                    }
                }

                const ws = XLSX.utils.aoa_to_sheet(aoa)

                // Bold the header row
                if (headers.length > 0) {
                    for (let ci = 0; ci < headers.length; ci++) {
                        const addr = XLSX.utils.encode_cell({ r: 0, c: ci })
                        if (ws[addr]) ws[addr].s = { font: { bold: true } }
                    }
                }

                // Auto-size columns (content-width, capped at 40 chars)
                const colWidths = headers.map((h) => Math.min(h.length, 40))
                for (const row of aoa.slice(1)) {
                    row.forEach((cell, ci) => {
                        const len = cell == null ? 0 : String(cell).length
                        if (len > (colWidths[ci] ?? 0)) colWidths[ci] = Math.min(len, 40)
                    })
                }
                ws['!cols'] = colWidths.map((w) => ({ wch: w + 2 }))

                XLSX.utils.book_append_sheet(wb, ws, sanitizeName(sheet.name))
            }

            const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
            const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            const name = `${fileName}.xlsx`

            if (onSave) {
                await onSave(blob, name)
            } else {
                saveBlob(blob, name)
            }
        } finally {
            setIsExporting(false)
        }
    }, [saveBlob])

    const readWorkbook = useCallback(async (source: File | Blob | ArrayBuffer | Uint8Array): Promise<ParsedSheet[]> => {
        const XLSX = await loadXlsx()

        let bytes: Uint8Array
        if (source instanceof Uint8Array) {
            bytes = source
        } else if (source instanceof ArrayBuffer) {
            bytes = new Uint8Array(source)
        } else {
            bytes = new Uint8Array(await (source as File | Blob).arrayBuffer())
        }

        const wb = XLSX.read(bytes, { type: 'array' })

        return wb.SheetNames.map((name: string) => {
            const ws = wb.Sheets[name]
            const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: null })

            if (aoa.length === 0) return { name, rows: [] as Record<string, CellValue>[] }

            const headerRow = aoa[0] ?? []
            const headers: string[] = headerRow.map((h: any, i: number) =>
                h != null && String(h).length ? String(h) : `col_${i}`,
            )

            const rows: Record<string, CellValue>[] = aoa.slice(1).map((row) => {
                const rec: Record<string, CellValue> = {}
                headers.forEach((h, i) => { rec[h] = (row[i] ?? null) as CellValue })
                return rec
            })

            return { name, rows }
        })
    }, [])

    return { exportSheets, readWorkbook, isExporting }
}
