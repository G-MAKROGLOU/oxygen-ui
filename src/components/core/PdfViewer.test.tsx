import React, { useState } from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'

// ── pdfjs-dist mock ───────────────────────────────────────────────────────────
// Pages are JSON item arrays set per test via `mock.pages`. The TextLayer mock
// creates one span per item, so highlight painting operates on a real DOM.
const mock = vi.hoisted(() => ({
    pages: [[{ str: 'hello world' }]] as Array<Array<{ str: string; hasEOL?: boolean }>>,
    textDelay: 0,
    failText: null as ((page: number) => boolean) | null,
}))

vi.mock('pdfjs-dist', () => {
    class MockTextLayer {
        private container: HTMLElement
        private items: Array<{ str: string }>
        textDivs: HTMLElement[] = []
        textContentItemsStr: string[] = []
        constructor({ textContentSource, container }: { textContentSource: { items: Array<{ str: string }> }; container: HTMLElement }) {
            this.container = container
            this.items = textContentSource.items
        }
        async render() {
            for (const it of this.items) {
                const span = document.createElement('span')
                span.textContent = it.str
                this.container.appendChild(span)
                this.textDivs.push(span)
                this.textContentItemsStr.push(it.str)
            }
        }
    }
    const makePage = (p: number) => ({
        getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale, scale }),
        render: () => ({ promise: Promise.resolve(), cancel: () => {} }),
        getTextContent: async () => {
            if (mock.textDelay > 0) await new Promise((r) => setTimeout(r, mock.textDelay))
            if (mock.failText?.(p)) throw new Error('text extraction failed')
            return { items: mock.pages[p - 1] ?? [] }
        },
        streamTextContent: () => ({ items: mock.pages[p - 1] ?? [] }),
    })
    return {
        version: '0.0.0-test',
        GlobalWorkerOptions: {} as { workerSrc?: string },
        getDocument: () => ({
            promise: Promise.resolve({
                numPages: mock.pages.length,
                getPage: async (p: number) => makePage(p),
                getData: async () => new Uint8Array([1, 2, 3]),
                destroy: () => {},
            }),
            destroy: () => {},
        }),
        TextLayer: MockTextLayer,
    }
})

import PdfViewer from './PdfViewer'

const scrollToSpy = vi.fn()

beforeAll(() => {
    // jsdom has no canvas 2d context and no element scrolling.
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({})) as unknown as typeof HTMLCanvasElement.prototype.getContext
    HTMLElement.prototype.scrollTo = scrollToSpy as unknown as typeof HTMLElement.prototype.scrollTo
})

beforeEach(() => {
    scrollToSpy.mockClear()
    mock.pages = [[{ str: 'hello world' }]]
    mock.textDelay = 0
    mock.failText = null
})

const src = () => new Uint8Array([1, 2, 3])

async function openSearch(queryText: string) {
    await waitFor(() => expect(screen.getByTitle('Search')).not.toBeDisabled())
    fireEvent.click(screen.getByTitle('Search'))
    fireEvent.change(screen.getByPlaceholderText('Find in document…'), { target: { value: queryText } })
}

const counter = () => screen.getByRole('status')
const searchInput = () => screen.getByPlaceholderText('Find in document…')
const highlightSpans = (c: HTMLElement) => c.querySelectorAll('.oxy-hl')
const activeSpans = (c: HTMLElement) => c.querySelectorAll('.oxy-hl-active')
const anchorSpans = (c: HTMLElement) => c.querySelectorAll('.oxy-hl-anchor')

describe('PdfViewer basics', () => {
    it('loads bytes (no network) and reports the page count', async () => {
        mock.pages = [[], [], []]
        const onLoad = vi.fn()
        render(<PdfViewer source={src()} textLayer={false} onLoad={onLoad} />)
        await waitFor(() => expect(onLoad).toHaveBeenCalledWith({ numPages: 3 }))
        expect(screen.getByText(/\/\s*3/)).toBeInTheDocument()
    })

    it('renders a retry-able error state on failure', async () => {
        const onError = vi.fn()
        render(<PdfViewer source={42 as unknown as Uint8Array} textLayer={false} onError={onError} />)
        await waitFor(() => expect(screen.getByText(/Couldn’t load the PDF/)).toBeInTheDocument())
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })
})

describe('search occurrences', () => {
    it('shows "n of total" occurrences and fires onSearchResults', async () => {
        mock.pages = [
            [{ str: 'the ship sails' }],
            [{ str: 'another ship and a third ship' }],
        ]
        const onResults = vi.fn()
        const { container } = render(<PdfViewer source={src()} onSearchResults={onResults} />)
        await openSearch('ship')
        await waitFor(() => expect(counter()).toHaveTextContent('1 of 3'))
        expect(onResults).toHaveBeenCalledWith({ query: 'ship', total: 3 })
        await waitFor(() => expect(highlightSpans(container).length).toBeGreaterThan(0))
    })

    it('shows "No matches" for an absent term', async () => {
        render(<PdfViewer source={src()} />)
        await openSearch('absent')
        await waitFor(() => expect(counter()).toHaveTextContent('No matches'))
    })

    it('steps with Enter and Shift+Enter, wrapping around', async () => {
        mock.pages = [[{ str: 'dog dog dog' }]]
        const onActive = vi.fn()
        render(<PdfViewer source={src()} onActiveMatchChange={onActive} />)
        await openSearch('dog')
        await waitFor(() => expect(counter()).toHaveTextContent('1 of 3'))
        fireEvent.keyDown(searchInput(), { key: 'Enter' })
        await waitFor(() => expect(counter()).toHaveTextContent('2 of 3'))
        fireEvent.keyDown(searchInput(), { key: 'Enter' })
        fireEvent.keyDown(searchInput(), { key: 'Enter' }) // wraps 3 -> 1
        await waitFor(() => expect(counter()).toHaveTextContent('1 of 3'))
        fireEvent.keyDown(searchInput(), { key: 'Enter', shiftKey: true }) // wraps 1 -> 3
        await waitFor(() => expect(counter()).toHaveTextContent('3 of 3'))
        expect(onActive).toHaveBeenLastCalledWith({ page: 1, index: 2 })
    })

    it('marks exactly one active match', async () => {
        mock.pages = [[{ str: 'cat cat cat cat' }]]
        const { container } = render(<PdfViewer source={src()} />)
        await openSearch('cat')
        await waitFor(() => expect(counter()).toHaveTextContent('1 of 4'))
        await waitFor(() => expect(highlightSpans(container).length).toBe(4))
        expect(activeSpans(container).length).toBe(1)
        fireEvent.keyDown(searchInput(), { key: 'Enter' })
        await waitFor(() => expect(counter()).toHaveTextContent('2 of 4'))
        expect(activeSpans(container).length).toBe(1)
    })

    it('scrolls when stepping to a match on an unmounted page', async () => {
        // Pages 1-2 are in the render window; page 4 is not.
        mock.pages = [
            [{ str: 'target here' }],
            [{ str: 'nothing' }],
            [{ str: 'nothing' }],
            [{ str: 'target far away' }],
        ]
        render(<PdfViewer source={src()} />)
        await openSearch('target')
        await waitFor(() => expect(counter()).toHaveTextContent('1 of 2'))
        scrollToSpy.mockClear()
        fireEvent.keyDown(searchInput(), { key: 'Enter' })
        await waitFor(() => expect(counter()).toHaveTextContent('2 of 2'))
        expect(scrollToSpy).toHaveBeenCalled()
    })

    it('paints highlights on a page that mounts after the search ran', async () => {
        mock.pages = [
            [{ str: 'nothing' }],
            [{ str: 'nothing' }],
            [{ str: 'nothing' }],
            [{ str: 'late target' }],
        ]
        const { container } = render(<PdfViewer source={src()} />)
        await openSearch('target')
        await waitFor(() => expect(counter()).toHaveTextContent('1 of 1'))
        expect(highlightSpans(container).length).toBe(0) // page 4 not mounted
        // Scroll the window down so page 4 mounts (offsets ~767px per page).
        const scroller = container.querySelector('.overflow-auto') as HTMLElement
        fireEvent.scroll(scroller, { target: { scrollTop: 2400 } })
        await waitFor(() => expect(highlightSpans(container).length).toBe(1))
        expect(activeSpans(container).length).toBe(1)
    })

    it('re-applies highlights after a zoom change', async () => {
        mock.pages = [[{ str: 'zoom target' }]]
        const { container } = render(<PdfViewer source={src()} />)
        await openSearch('target')
        await waitFor(() => expect(highlightSpans(container).length).toBe(1))
        fireEvent.click(screen.getByTitle('Zoom in')) // re-renders the text layer
        await waitFor(() => expect(highlightSpans(container).length).toBe(1))
    })

    it('removes highlight spans fully and restores the text when the query clears', async () => {
        mock.pages = [[{ str: 'alpha beta gamma' }]]
        const { container } = render(<PdfViewer source={src()} />)
        await openSearch('beta')
        await waitFor(() => expect(highlightSpans(container).length).toBe(1))
        fireEvent.change(searchInput(), { target: { value: '' } })
        await waitFor(() => expect(highlightSpans(container).length).toBe(0))
        const itemSpan = Array.from(container.querySelectorAll('.oxy-textLayer > span'))
            .find((s) => s.textContent === 'alpha beta gamma')
        expect(itemSpan).toBeDefined()
        expect(itemSpan?.childElementCount).toBe(0) // one pure text node again
    })

    it('closes and clears with Escape', async () => {
        mock.pages = [[{ str: 'needle in page' }]]
        const { container } = render(<PdfViewer source={src()} />)
        await openSearch('needle')
        await waitFor(() => expect(highlightSpans(container).length).toBe(1))
        fireEvent.keyDown(searchInput(), { key: 'Escape' })
        await waitFor(() => expect(screen.queryByPlaceholderText('Find in document…')).not.toBeInTheDocument())
        await waitFor(() => expect(highlightSpans(container).length).toBe(0))
    })

    it('survives a document change during a search without an unhandled rejection', async () => {
        mock.pages = [[{ str: 'slow page' }], [{ str: 'slow page' }]]
        mock.textDelay = 40
        const { rerender } = render(<PdfViewer source={src()} />)
        await openSearch('slow')
        // Swap the document while the extraction loop is still running.
        rerender(<PdfViewer source={src()} />)
        await waitFor(() => expect(screen.getByTitle('Search')).not.toBeDisabled())
        mock.textDelay = 0
        // The search bar stays open across the reload; a new query works.
        fireEvent.change(searchInput(), { target: { value: 'page' } })
        await waitFor(() => expect(counter()).toHaveTextContent('1 of 2'))
    })

    it('clears the searching state when extraction fails mid-search', async () => {
        mock.pages = [[{ str: 'ok' }], [{ str: 'ok' }]]
        mock.failText = (p) => p === 2
        render(<PdfViewer source={src()} />)
        await openSearch('ok')
        await waitFor(() => expect(counter()).not.toHaveTextContent('Searching'))
    })
})

describe('controlled page prop', () => {
    it('keeps uncontrolled behavior without the prop', async () => {
        mock.pages = [[], [], []]
        render(<PdfViewer source={src()} textLayer={false} />)
        await waitFor(() => expect(screen.getByLabelText('Page number')).toHaveValue('1'))
    })

    it('scrolls on a controlled page change after mount', async () => {
        mock.pages = [[], [], [], [], []]
        const { rerender } = render(<PdfViewer source={src()} textLayer={false} page={1} />)
        await waitFor(() => expect(screen.getByLabelText('Page number')).toHaveValue('1'))
        scrollToSpy.mockClear()
        rerender(<PdfViewer source={src()} textLayer={false} page={3} />)
        await waitFor(() => expect(scrollToSpy).toHaveBeenCalled())
        expect(screen.getByLabelText('Page number')).toHaveValue('3')
    })

    it('clamps out-of-range values to 1..numPages', async () => {
        mock.pages = [[], [], []]
        render(<PdfViewer source={src()} textLayer={false} page={99} />)
        await waitFor(() => expect(screen.getByLabelText('Page number')).toHaveValue('3'))
    })

    it('does not loop when the parent echoes onPageChange into page', async () => {
        mock.pages = [[], [], []]
        function Controlled() {
            const [p, setP] = useState(1)
            return <PdfViewer source={src()} textLayer={false} page={p} onPageChange={setP} />
        }
        const { container } = render(<Controlled />)
        await waitFor(() => expect(screen.getByLabelText('Page number')).toHaveValue('1'))
        scrollToSpy.mockClear()
        // User scrolls to page 2; the parent echoes it back as the prop.
        const scroller = container.querySelector('.overflow-auto') as HTMLElement
        fireEvent.scroll(scroller, { target: { scrollTop: 800 } })
        await waitFor(() => expect(screen.getByLabelText('Page number')).toHaveValue('2'))
        expect(scrollToSpy).not.toHaveBeenCalled()
    })
})

describe('highlight prop', () => {
    it('resolves a found phrase, paints the anchor, and syncs onPageChange', async () => {
        mock.pages = [
            [{ str: 'first page text' }],
            [{ str: 'the proposed system works well' }],
        ]
        const onResolved = vi.fn()
        const onPageChange = vi.fn()
        const { container } = render(
            <PdfViewer
                source={src()}
                highlight={{ page: 2, phrase: 'the proposed  system works' }}
                onHighlightResolved={onResolved}
                onPageChange={onPageChange}
            />,
        )
        await waitFor(() => expect(onResolved).toHaveBeenCalledWith({ found: true }))
        expect(onPageChange).toHaveBeenCalledWith(2)
        await waitFor(() => expect(anchorSpans(container).length).toBeGreaterThan(0))
    })

    it('reports found: false and paints nothing when the phrase misses', async () => {
        mock.pages = [[{ str: 'page one' }], [{ str: 'page two' }]]
        const onResolved = vi.fn()
        const { container } = render(
            <PdfViewer source={src()} highlight={{ page: 2, phrase: 'entirely different content' }} onHighlightResolved={onResolved} />,
        )
        await waitFor(() => expect(onResolved).toHaveBeenCalledWith({ found: false }))
        expect(anchorSpans(container).length).toBe(0)
    })

    it('re-resolves when the prop changes and clears on null without scrolling', async () => {
        mock.pages = [[{ str: 'alpha section' }], [{ str: 'beta section' }]]
        const onResolved = vi.fn()
        const { container, rerender } = render(
            <PdfViewer source={src()} highlight={{ page: 1, phrase: 'alpha section' }} onHighlightResolved={onResolved} />,
        )
        await waitFor(() => expect(anchorSpans(container).length).toBeGreaterThan(0))
        rerender(<PdfViewer source={src()} highlight={{ page: 2, phrase: 'beta section' }} onHighlightResolved={onResolved} />)
        await waitFor(() => expect(onResolved).toHaveBeenCalledTimes(2))
        // Wait for the refine scroll of the second anchor before asserting
        // that clearing the prop does not scroll.
        await waitFor(() => expect(scrollToSpy).toHaveBeenCalled())
        scrollToSpy.mockClear()
        rerender(<PdfViewer source={src()} highlight={null} onHighlightResolved={onResolved} />)
        await waitFor(() => expect(anchorSpans(container).length).toBe(0))
        expect(scrollToSpy).not.toHaveBeenCalled()
        expect(onResolved).toHaveBeenCalledTimes(2) // null is not a resolution
    })

    it('shows the prop highlight and search highlights at the same time, uncounted', async () => {
        mock.pages = [[{ str: 'shared words and a phrase target' }]]
        const { container } = render(
            <PdfViewer source={src()} highlight={{ page: 1, phrase: 'phrase target' }} />,
        )
        await waitFor(() => expect(anchorSpans(container).length).toBeGreaterThan(0))
        await openSearch('words')
        await waitFor(() => expect(counter()).toHaveTextContent('1 of 1')) // anchor not counted
        expect(highlightSpans(container).length).toBe(1)
        expect(anchorSpans(container).length).toBeGreaterThan(0)
    })

    it('works together with a controlled page', async () => {
        mock.pages = [[{ str: 'one' }], [{ str: 'two here' }], [{ str: 'three' }]]
        function Controlled() {
            const [p, setP] = useState(1)
            return (
                <PdfViewer
                    source={src()}
                    textLayer
                    page={p}
                    onPageChange={setP}
                    highlight={{ page: 2, phrase: 'two here' }}
                />
            )
        }
        render(<Controlled />)
        // The highlight's onPageChange(2) feeds the parent state, which feeds
        // the controlled prop back; the pager settles on page 2.
        await waitFor(() => expect(screen.getByLabelText('Page number')).toHaveValue('2'))
    })
})
