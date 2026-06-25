import React, { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import PdfViewer from './PdfViewer'

const meta: Meta<typeof PdfViewer> = {
    title: 'Data Display/PdfViewer',
    component: PdfViewer,

    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    argTypes: {
        zoom: { control: { type: 'range', min: 0.5, max: 3, step: 0.1 } },
        height: { control: 'text' },
        width: { control: 'text' },
        initialPage: { control: { type: 'number', min: 1 } },
        textLayer: { control: 'boolean' },
        thumbnails: { control: 'boolean' },
        toolbar: { control: 'object' },
    },
}
export default meta
type Story = StoryObj<typeof PdfViewer>

// ── In-browser PDF generation (no network) ────────────────────────────────────
// jsPDF is already a dependency of this library (used for Spreadsheet export).
// Using it here keeps stories self-contained and offline-capable.

interface PdfSpec {
    pages: number
    withText?: boolean
    withImages?: boolean
}

function useGeneratedPdf({ pages, withText = true }: PdfSpec) {
    const [bytes, setBytes] = useState<Uint8Array | null>(null)
    useEffect(() => {
        let cancelled = false
        void import('jspdf').then(({ jsPDF }) => {
            const doc = new jsPDF({ unit: 'pt', format: 'a4' })
            const W = doc.internal.pageSize.getWidth()

            for (let i = 1; i <= pages; i++) {
                if (i > 1) doc.addPage()

                // Page header
                doc.setFillColor(30, 58, 138)
                doc.rect(0, 0, W, 48, 'F')
                doc.setTextColor(255, 255, 255)
                doc.setFontSize(16)
                doc.setFont('helvetica', 'bold')
                doc.text(`Chapter ${i}: Vessel Performance Report`, 32, 30)

                // Body
                doc.setTextColor(30, 41, 59)
                doc.setFontSize(22)
                doc.setFont('helvetica', 'bold')
                doc.text(`Page ${i} of ${pages}`, 32, 90)

                if (withText) {
                    doc.setFontSize(11)
                    doc.setFont('helvetica', 'normal')
                    doc.setTextColor(71, 85, 105)
                    const body =
                        'The quick brown fox jumps over the lazy dog. ' +
                        'Sphinx of black quartz, judge my vow. ' +
                        'Pack my box with five dozen liquor jugs. ' +
                        'How valiantly did the six jet black zebras explode.'
                    doc.text(body, 32, 120, { maxWidth: W - 64 })

                    // Table-like lines
                    const cols = ['Vessel', 'IMO', 'DWT (t)', 'CII', 'Status']
                    const rows = [
                        ['MV Aurora', '9876543', '81,200', 'B', 'In service'],
                        ['MV Borealis', '9123456', '115,000', 'C', 'Drydock'],
                        ['MV Calypso', '9234567', '64,000', 'A', 'In service'],
                        ['MV Dorado', '9345678', '93,400', 'D', 'In service'],
                        ['MV Eos', '9456789', '72,100', 'B', 'Laid up'],
                    ]
                    const colW = (W - 64) / cols.length
                    const startY = 200

                    // Header row
                    doc.setFillColor(241, 245, 249)
                    doc.rect(32, startY - 16, W - 64, 22, 'F')
                    doc.setFont('helvetica', 'bold')
                    doc.setFontSize(10)
                    doc.setTextColor(30, 41, 59)
                    cols.forEach((c, ci) => doc.text(c, 36 + ci * colW, startY))

                    // Data rows
                    doc.setFont('helvetica', 'normal')
                    rows.forEach((row, ri) => {
                        const y = startY + (ri + 1) * 22
                        if (ri % 2 === 0) {
                            doc.setFillColor(248, 250, 252)
                            doc.rect(32, y - 14, W - 64, 22, 'F')
                        }
                        doc.setTextColor(51, 65, 85)
                        row.forEach((cell, ci) => doc.text(cell, 36 + ci * colW, y))
                        doc.setDrawColor(226, 232, 240)
                        doc.line(32, y + 8, W - 32, y + 8)
                    })
                }

                // Footer
                doc.setFontSize(9)
                doc.setTextColor(148, 163, 184)
                doc.setFont('helvetica', 'normal')
                doc.text(`Confidential: ${new Date().getFullYear()} Fleet Operations Report: Page ${i}`, 32, 820)
                doc.setDrawColor(203, 213, 225)
                doc.line(32, 808, W - 32, 808)
            }

            if (!cancelled) setBytes(new Uint8Array(doc.output('arraybuffer')))
        })
        return () => { cancelled = true }
    }, [pages, withText])
    return bytes
}

const PdfLoader = ({
    pages,
    withText,
    ...props
}: { pages: number; withText?: boolean } & Partial<React.ComponentProps<typeof PdfViewer>>) => {
    const bytes = useGeneratedPdf({ pages, withText })
    if (!bytes) return (
        <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-surface">
            <p className="text-sm text-foreground-muted">Generating PDF…</p>
        </div>
    )
    return <PdfViewer source={bytes} onLoad={(n) => console.log(`PdfViewer loaded ${n} pages`)} {...props} />
}

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
    name: 'Default: continuous scroll, fit-width',
    parameters: {
        docs: {
            description: {
                story:
                    'The default mode: continuous vertical scroll, width snapped to fit the container, text layer on. ' +
                    'The toolbar contains a page-jump input, zoom controls, fit-width/fit-page toggles, a search bar, and download/print buttons.',
            },
        },
    },
    render: () => <PdfLoader pages={8} />,
}

export const WithThumbnails: Story = {
    name: 'Thumbnail rail',
    parameters: {
        docs: {
            description: {
                story:
                    'Add `thumbnails` to show a collapsible thumbnail rail on the left. ' +
                    'Clicking a thumbnail jumps directly to that page.',
            },
        },
    },
    render: () => <PdfLoader pages={14} thumbnails style={{ height: 700 }} />,
}

export const TextLayerAndSearch: Story = {
    name: 'Text layer + in-document search',
    parameters: {
        docs: {
            description: {
                story:
                    'The text layer overlays invisible, selectable spans aligned to the PDF glyphs. ' +
                    'The toolbar search bar highlights all matches as you type (debounced 220 ms). ' +
                    'Try searching for "vessel", "MV", or any word from the page content.',
            },
        },
    },
    render: () => <PdfLoader pages={6} textLayer style={{ height: 700 }} />,
}

export const InitialPageAndZoom: Story = {
    name: 'Initial page + zoom level',
    parameters: {
        docs: {
            description: {
                story:
                    '`initialPage` (1-based) scrolls the viewer to that page on first load. ' +
                    '`zoom` sets the starting scale factor: here 1.4 (140%).',
            },
        },
    },
    render: () => <PdfLoader pages={10} initialPage={5} zoom={1.4} style={{ height: 700 }} />,
}

export const CustomDimensions: Story = {
    name: 'Custom height and width',
    parameters: {
        docs: {
            description: {
                story:
                    '`height` and `width` accept any CSS length string or a pixel number. ' +
                    'Useful when embedding the viewer in a fixed panel or alongside other content.',
            },
        },
    },
    render: () => (
        <div style={{ display: 'flex', gap: 16 }}>
            <PdfLoader pages={3} height={480} width={380} />
            <PdfLoader pages={3} height={480} width={380} />
        </div>
    ),
}

export const MinimalPager: Story = {
    name: 'Toolbar: pager only',
    parameters: {
        docs: {
            description: {
                story:
                    'Pass a `toolbar` object to show only the controls you need. ' +
                    'Here only `pager` and `zoom` are enabled: ideal for embed contexts where the full toolbar would be intrusive.',
            },
        },
    },
    render: () => <PdfLoader pages={5} toolbar={{ pager: true, zoom: true }} textLayer={false} />,
}

export const NoToolbar: Story = {
    name: 'No toolbar: embed mode',
    parameters: {
        docs: {
            description: {
                story:
                    'Set `toolbar={false}` to hide the toolbar entirely. ' +
                    'The viewer becomes a pure reading surface: no controls, no chrome. ' +
                    'Navigation is still available via keyboard (arrow keys, Page Up/Down).',
            },
        },
    },
    render: () => <PdfLoader pages={4} toolbar={false} textLayer={false} style={{ height: 560 }} />,
}

export const ManyPages: Story = {
    name: 'Virtualized: 250 pages',
    parameters: {
        docs: {
            description: {
                story:
                    'Only the pages inside the viewport are rendered to canvas. ' +
                    'Off-screen pages are represented by empty placeholder divs that match their actual height, ' +
                    'so the scrollbar behaves correctly even for large documents. ' +
                    'Scroll to any page: rendering is instant.',
            },
        },
    },
    render: () => <PdfLoader pages={250} withText={false} style={{ height: 700 }} />,
}

export const ErrorState: Story = {
    name: 'Error state: unreachable source',
    parameters: {
        docs: {
            description: {
                story:
                    'When loading fails (bad URL, corrupt bytes, network error), the viewer shows an error panel with a Retry button. ' +
                    '`onError` is called with the thrown `Error`.',
            },
        },
    },
    render: () => (
        <PdfViewer
            source="https://this-domain-does-not-exist.invalid/document.pdf"
            onError={(e) => console.error('PdfViewer error', e)}
            style={{ height: 300 }}
        />
    ),
}
