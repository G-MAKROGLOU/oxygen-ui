import React, { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import PdfViewer from './PdfViewer'

const meta: Meta<typeof PdfViewer> = {
    title: 'Data Display/PdfViewer',
    component: PdfViewer,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof PdfViewer>

// Builds a multi-page PDF in the browser (jsPDF) so the stories need zero
// network — exactly mode 1 (programmatic bytes). Real apps pass a URL, File or
// their own bytes.
function useGeneratedPdf(pages: number) {
    const [bytes, setBytes] = useState<Uint8Array | null>(null)
    useEffect(() => {
        let cancelled = false
        void import('jspdf').then(({ jsPDF }) => {
            const doc = new jsPDF({ unit: 'pt', format: 'a4' })
            for (let i = 1; i <= pages; i++) {
                if (i > 1) doc.addPage()
                doc.setFontSize(28); doc.text(`Page ${i}`, 56, 90)
                doc.setFontSize(12)
                doc.text('The quick brown fox jumps over the lazy dog.', 56, 130)
                doc.text('Sphinx of black quartz, judge my vow — selectable text layer.', 56, 150)
                doc.setDrawColor(180); doc.rect(56, 180, 480, 560)
            }
            if (!cancelled) setBytes(new Uint8Array(doc.output('arraybuffer')))
        })
        return () => { cancelled = true }
    }, [pages])
    return bytes
}

const Loader = ({ pages, ...props }: { pages: number } & Partial<React.ComponentProps<typeof PdfViewer>>) => {
    const bytes = useGeneratedPdf(pages)
    if (!bytes) return <p className="text-sm text-foreground-muted">Generating PDF…</p>
    return <PdfViewer source={bytes} onLoad={(i) => console.log('loaded', i)} {...props} />
}

export const Default: Story = {
    name: 'Default (continuous scroll, fit width)',
    render: () => <Loader pages={8} />,
}

export const WithThumbnails: Story = {
    name: 'Thumbnail rail',
    render: () => <Loader pages={12} thumbnails style={{ height: 680 }} />,
}

export const ManyPages: Story = {
    name: 'Virtualized — 250 pages',
    parameters: { docs: { description: { story: 'Only the pages inside the viewport are rendered to canvas, so scrolling stays smooth regardless of page count.' } } },
    render: () => <Loader pages={250} style={{ height: 680 }} />,
}

export const MinimalToolbar: Story = {
    name: 'Pager only',
    render: () => <Loader pages={5} toolbar={{ pager: true, zoom: true }} textLayer={false} />,
}
