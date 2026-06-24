import React, { useRef, useState, useCallback } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { usePdf } from './usePdf'
import type { PdfPage } from './usePdf'
import Button from '../components/inputs/Button'

const meta: Meta = {
    title: 'Hooks/usePdf',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

// ── Canvas drawing helpers ────────────────────────────────────────────────────

function drawSamplePage(
    canvas: HTMLCanvasElement,
    title: string,
    color: string,
    bars: number[],
): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width: W, height: H } = canvas

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    // Title
    ctx.fillStyle = '#1a2744'
    ctx.font = `bold ${Math.round(H * 0.05)}px sans-serif`
    ctx.fillText(title, 40, 56)

    // Simple bar chart
    const barAreaX = 40
    const barAreaY = 80
    const barAreaW = W - 80
    const barAreaH = H - 140
    const barW = Math.floor(barAreaW / bars.length) - 8
    const maxVal = Math.max(...bars)

    bars.forEach((val, i) => {
        const h = Math.round((val / maxVal) * barAreaH)
        const x = barAreaX + i * (barW + 8)
        const y = barAreaY + barAreaH - h

        ctx.fillStyle = color
        ctx.globalAlpha = 0.85
        ctx.fillRect(x, y, barW, h)
        ctx.globalAlpha = 1

        // Label
        ctx.fillStyle = '#555e7a'
        ctx.font = `${Math.round(H * 0.03)}px sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(String(val), x + barW / 2, y - 6)

        // X axis label
        ctx.fillText(`M${i + 1}`, x + barW / 2, barAreaY + barAreaH + 20)
    })

    ctx.textAlign = 'left'
}

function makeCanvas(title: string, color: string, bars: number[]): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 500
    drawSamplePage(canvas, title, color, bars)
    return canvas
}

// ── Single canvas ─────────────────────────────────────────────────────────────

export const SingleCanvas: Story = {
    name: 'exportCanvases — single page',
    parameters: {
        docs: {
            description: {
                story:
                    'Draws a sample chart onto an `HTMLCanvasElement`, then exports it as a one-page PDF. ' +
                    'Pass `onSave` to receive the `Blob` without triggering a download — useful for upload pipelines.',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { exportCanvases, isExporting } = usePdf()
            const [info, setInfo] = useState<string | null>(null)

            const handleExport = useCallback(async () => {
                const canvas = makeCanvas('Fleet CO₂ Emissions — 2024', '#2563eb', [1240, 1180, 1320, 1095, 1410, 1290])
                await exportCanvases([{ canvas, title: 'Fleet CO₂ Emissions 2024' }], {
                    fileName: 'emissions',
                    onSave: async (blob, name) => {
                        setInfo(`PDF ready: "${name}" — ${blob.size.toLocaleString()} bytes`)
                        // In a real app: trigger a download or upload the blob.
                    },
                })
            }, [exportCanvases])

            return (
                <div className="flex flex-col items-center gap-4" style={{ width: 380 }}>
                    <div className="w-full rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">One canvas → one PDF page</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            The canvas is scaled to fill the page (landscape by default) while preserving its aspect ratio.
                            A bold centred title header is reserved above the image.
                        </p>
                    </div>
                    <Button
                        content={isExporting ? 'Generating…' : 'Export single-page PDF'}
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

// ── Multi-page ────────────────────────────────────────────────────────────────

export const MultiPage: Story = {
    name: 'exportCanvases — multiple pages',
    parameters: {
        docs: {
            description: {
                story:
                    'Pass an array of `PdfPage` objects — each becomes a separate page. ' +
                    'Canvases with `width === 0` or `height === 0` are silently skipped.',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { exportCanvases, isExporting } = usePdf()

            const pages: PdfPage[] = [
                {
                    canvas: makeCanvas('CO₂ Emissions (t) — 2024', '#2563eb', [1240, 1180, 1320, 1095, 1410, 1290]),
                    title: 'CO₂ Emissions',
                },
                {
                    canvas: makeCanvas('Fuel Consumption (t) — 2024', '#16a34a', [396, 377, 421, 350, 450, 412]),
                    title: 'Fuel Consumption',
                },
                {
                    canvas: makeCanvas('Distance Sailed (nm) — 2024', '#9333ea', [8200, 7900, 8600, 7200, 9100, 8450]),
                    title: 'Distance Sailed',
                },
            ]

            return (
                <div className="flex flex-col items-center gap-4" style={{ width: 380 }}>
                    <div className="w-full rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">3 canvases → 3-page PDF</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            Each entry in the array becomes a page. The optional <code>title</code> field
                            reserves 28 px at the top of the page for a bold centred heading.
                        </p>
                    </div>
                    <Button
                        content={isExporting ? 'Generating…' : 'Export 3-page PDF'}
                        disabled={isExporting}
                        onClick={() => exportCanvases(pages, { fileName: 'fleet-report' })}
                    />
                </div>
            )
        }
        return <Demo />
    },
}

// ── Portrait orientation ──────────────────────────────────────────────────────

export const PortraitOrientation: Story = {
    name: 'exportCanvases — portrait orientation',
    parameters: {
        docs: {
            description: {
                story:
                    "The default orientation is `'landscape'`. Pass `orientation: 'portrait'` when your content is taller than it is wide.",
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { exportCanvases, isExporting } = usePdf()

            const handlePortrait = useCallback(async () => {
                // Tall canvas fits portrait better.
                const canvas = document.createElement('canvas')
                canvas.width = 500
                canvas.height = 800
                const ctx = canvas.getContext('2d')!
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, 0, 500, 800)
                ctx.fillStyle = '#1a2744'
                ctx.font = 'bold 28px sans-serif'
                ctx.fillText('Vessel Report', 40, 60)
                ctx.font = '16px sans-serif'
                ctx.fillStyle = '#555e7a'
                const lines = [
                    'MV Aurora — Bulk Carrier — DWT 81,200',
                    'MV Borealis — Tanker — DWT 115,000',
                    'MV Calypso — Container — DWT 64,000',
                    'MV Dorado — Bulk Carrier — DWT 93,400',
                    'MV Eos — Tanker — DWT 72,100',
                ]
                lines.forEach((line, i) => ctx.fillText(line, 40, 120 + i * 36))

                await exportCanvases(
                    [{ canvas, title: 'Vessel Summary' }],
                    { fileName: 'vessel-summary', orientation: 'portrait' },
                )
            }, [exportCanvases])

            return (
                <div className="flex flex-col items-center gap-4" style={{ width: 380 }}>
                    <div className="w-full rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">Portrait A4 page</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            <code>orientation: 'portrait'</code> — the canvas is scaled to fill the narrower portrait page while preserving aspect ratio.
                        </p>
                    </div>
                    <Button
                        content={isExporting ? 'Generating…' : 'Export portrait PDF'}
                        disabled={isExporting}
                        onClick={handlePortrait}
                    />
                </div>
            )
        }
        return <Demo />
    },
}

// ── Canvas with a real chart (via canvas ref) ─────────────────────────────────

export const LiveCanvas: Story = {
    name: 'exportCanvases — from a rendered canvas element',
    parameters: {
        docs: {
            description: {
                story:
                    'Pass a ref to a canvas that is already in the DOM — e.g. a Chart.js or D3 chart. ' +
                    'The hook reads `canvas.toDataURL()` at the moment of export, so the image captures whatever is currently rendered.',
            },
        },
    },
    render: () => {
        const Demo = () => {
            const { exportCanvases, isExporting } = usePdf()
            const canvasRef = useRef<HTMLCanvasElement>(null)
            const [drawn, setDrawn] = useState(false)

            const draw = useCallback(() => {
                const canvas = canvasRef.current
                if (!canvas) return
                drawSamplePage(canvas, 'Live Canvas Export', '#e11d48', [88, 72, 95, 61, 84, 90, 77])
                setDrawn(true)
            }, [])

            const exportPdf = useCallback(async () => {
                const canvas = canvasRef.current
                if (!canvas) return
                await exportCanvases([{ canvas, title: 'Monthly KPIs' }], { fileName: 'kpi-chart' })
            }, [exportCanvases])

            return (
                <div className="flex flex-col gap-4" style={{ width: 440 }}>
                    <div className="rounded-lg border border-border bg-surface p-4 text-sm">
                        <p className="font-medium text-foreground">Render, then export a live canvas ref</p>
                        <p className="mt-1 text-xs text-foreground-muted">
                            Works with any canvas-based charting library. The hook captures whatever the canvas holds at export time.
                        </p>
                    </div>
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={300}
                        className="w-full rounded-lg border border-border bg-surface"
                        style={{ aspectRatio: '800/300' }}
                    />
                    <div className="flex gap-3">
                        <Button variant="secondary" content="Draw chart" onClick={draw} className="flex-1" />
                        <Button
                            content={isExporting ? 'Generating…' : 'Export PDF'}
                            disabled={isExporting || !drawn}
                            onClick={exportPdf}
                            className="flex-1"
                        />
                    </div>
                    {!drawn && (
                        <p className="text-center text-xs text-foreground-muted">Draw the chart first, then export it.</p>
                    )}
                </div>
            )
        }
        return <Demo />
    },
}
