import { useState, useCallback } from 'react'
import type { ExportSaveOptions } from './useExcel'
import { useDownload } from './useDownload'

export interface PdfPage {
    canvas: HTMLCanvasElement
    title?: string
}

export interface PdfExportOptions extends ExportSaveOptions {
    /** Orientation of every page. Default 'landscape'. */
    orientation?: 'portrait' | 'landscape'
}

export interface UsePdfReturn {
    exportCanvases: (pages: PdfPage[], options?: PdfExportOptions) => Promise<void>
    isExporting: boolean
}

let jspdfPromise: Promise<any> | null = null
const loadJspdf = () => (jspdfPromise ??= import('jspdf'))

export function usePdf(): UsePdfReturn {
    const [isExporting, setIsExporting] = useState(false)
    const { saveBlob } = useDownload()

    const exportCanvases = useCallback(async (pages: PdfPage[], options: PdfExportOptions = {}) => {
        const { fileName = 'report', onSave, orientation = 'landscape' } = options

        const validPages = pages.filter((p) => p.canvas.width !== 0 && p.canvas.height !== 0)
        if (validPages.length === 0) return

        setIsExporting(true)
        try {
            const { jsPDF } = await loadJspdf()
            const pdf = new jsPDF({ orientation, unit: 'px', compress: true })

            const pageW = pdf.internal.pageSize.getWidth()
            const pageH = pdf.internal.pageSize.getHeight()
            const TITLE_H = 28

            for (let i = 0; i < validPages.length; i++) {
                const { canvas, title } = validPages[i]

                if (i > 0) pdf.addPage()

                let contentY = 0
                const contentH = title ? pageH - TITLE_H : pageH

                if (title) {
                    pdf.setFontSize(12)
                    pdf.setFont('helvetica', 'bold')
                    pdf.text(title, pageW / 2, TITLE_H / 2 + 6, { align: 'center' })
                    contentY = TITLE_H
                }

                const scale = Math.min(pageW / canvas.width, contentH / canvas.height)
                const w = canvas.width * scale
                const h = canvas.height * scale
                const x = (pageW - w) / 2
                const y = contentY + (contentH - h) / 2

                pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', x, y, w, h)
            }

            const blob = pdf.output('blob') as Blob
            const name = `${fileName}.pdf`

            if (onSave) {
                await onSave(blob, name)
            } else {
                saveBlob(blob, name)
            }
        } finally {
            setIsExporting(false)
        }
    }, [saveBlob])

    return { exportCanvases, isExporting }
}
