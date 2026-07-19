import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'

// Mock the heavy pdfjs-dist engine, the component only relies on this surface.
vi.mock('pdfjs-dist', () => {
    const page = {
        getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale, scale }),
        render: () => ({ promise: Promise.resolve(), cancel: () => {} }),
        getTextContent: async () => ({ items: [{ str: 'hello world' }] }),
        streamTextContent: () => ({}),
    }
    const pdf = {
        numPages: 3,
        getPage: async () => page,
        getData: async () => new Uint8Array([1, 2, 3]),
        destroy: () => {},
    }
    return {
        version: '0.0.0-test',
        GlobalWorkerOptions: {} as { workerSrc?: string },
        getDocument: () => ({ promise: Promise.resolve(pdf), destroy: () => {} }),
        TextLayer: class {
            async render() {}
        },
    }
})

import PdfViewer from './PdfViewer'

beforeAll(() => {
    // jsdom has no canvas 2d context.
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({})) as unknown as typeof HTMLCanvasElement.prototype.getContext
})

describe('PdfViewer', () => {
    it('loads bytes (no network) and reports the page count', async () => {
        const onLoad = vi.fn()
        render(<PdfViewer source={new Uint8Array([1, 2, 3])} textLayer={false} onLoad={onLoad} />)
        await waitFor(() => expect(onLoad).toHaveBeenCalledWith({ numPages: 3 }))
        expect(screen.getByText(/\/\s*3/)).toBeInTheDocument()
    })

    it('renders a retry-able error state on failure', async () => {
        const onError = vi.fn()
        // A bogus source type that sourceToBytes/getDocument can't handle.
        render(<PdfViewer source={42 as unknown as Uint8Array} textLayer={false} onError={onError} />)
        await waitFor(() => expect(screen.getByText(/Couldn’t load the PDF/)).toBeInTheDocument())
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })
})
