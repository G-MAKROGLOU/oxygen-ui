import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePdf } from './usePdf'

// ── jsPDF mock ──────────────────────────────────────────────────────────────
// vi.fn() with an arrow function isn't new-able. Use a regular function so
// `new jsPDF()` works and returns the shared spy instance.
const mockOutput = vi.fn(() => new Blob(['%PDF'], { type: 'application/pdf' }))
const mockAddImage = vi.fn()
const mockAddPage = vi.fn()
const mockSetFont = vi.fn()
const mockSetFontSize = vi.fn()
const mockText = vi.fn()

const mockJsPDFInstance = {
    internal: { pageSize: { getWidth: () => 800, getHeight: () => 600 } },
    addPage: mockAddPage,
    addImage: mockAddImage,
    setFont: mockSetFont,
    setFontSize: mockSetFontSize,
    text: mockText,
    output: mockOutput,
}

// Must use a regular (non-arrow) function so it can be called with `new`.
const mockJsPDF = vi.fn(function MockJsPDF(this: unknown) {
    return mockJsPDFInstance
})

vi.mock('jspdf', () => ({ jsPDF: mockJsPDF }))

// ── Canvas factory ──────────────────────────────────────────────────────────
function makeCanvas(w = 400, h = 300): HTMLCanvasElement {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    // stub toDataURL (not available in jsdom by default)
    c.toDataURL = vi.fn(() => 'data:image/png;base64,fakedata')
    return c
}

describe('usePdf', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset URL stubs
        vi.stubGlobal('URL', {
            createObjectURL: vi.fn(() => 'blob:fake'),
            revokeObjectURL: vi.fn(),
        })
    })

    it('returns isExporting=false initially', () => {
        const { result } = renderHook(() => usePdf())
        expect(result.current.isExporting).toBe(false)
    })

    it('is a no-op when all canvases have zero dimensions', async () => {
        const { result } = renderHook(() => usePdf())
        await act(async () => {
            await result.current.exportCanvases([{ canvas: makeCanvas(0, 0) }])
        })
        expect(mockJsPDF).not.toHaveBeenCalled()
        expect(result.current.isExporting).toBe(false)
    })

    it('calls onSave with a PDF blob and the correct filename', async () => {
        const onSave = vi.fn()
        const { result } = renderHook(() => usePdf())

        await act(async () => {
            await result.current.exportCanvases(
                [{ canvas: makeCanvas() }],
                { fileName: 'charts', onSave },
            )
        })

        expect(onSave).toHaveBeenCalledOnce()
        const [blob, name] = onSave.mock.calls[0]
        expect(name).toBe('charts.pdf')
        expect(blob).toBeInstanceOf(Blob)
    })

    it('adds a page per canvas (first page is implicit, rest via addPage)', async () => {
        const { result } = renderHook(() => usePdf())
        const onSave = vi.fn()

        await act(async () => {
            await result.current.exportCanvases(
                [{ canvas: makeCanvas() }, { canvas: makeCanvas() }, { canvas: makeCanvas() }],
                { onSave },
            )
        })

        // 3 canvases → addPage called for pages 2 and 3
        expect(mockAddPage).toHaveBeenCalledTimes(2)
        expect(mockAddImage).toHaveBeenCalledTimes(3)
    })

    it('writes a centered bold title when the page has a title', async () => {
        const { result } = renderHook(() => usePdf())
        const onSave = vi.fn()

        await act(async () => {
            await result.current.exportCanvases(
                [{ canvas: makeCanvas(), title: 'My Report' }],
                { onSave },
            )
        })

        expect(mockText).toHaveBeenCalledWith('My Report', expect.any(Number), expect.any(Number), { align: 'center' })
        expect(mockSetFont).toHaveBeenCalledWith('helvetica', 'bold')
    })

    it('skips the title block when no title is provided', async () => {
        const { result } = renderHook(() => usePdf())
        const onSave = vi.fn()

        await act(async () => {
            await result.current.exportCanvases([{ canvas: makeCanvas() }], { onSave })
        })

        expect(mockText).not.toHaveBeenCalled()
    })

    it('isExporting is false after export completes', async () => {
        const onSave = vi.fn()
        const { result } = renderHook(() => usePdf())

        await act(async () => {
            await result.current.exportCanvases([{ canvas: makeCanvas() }], { onSave })
        })

        expect(result.current.isExporting).toBe(false)
        expect(onSave).toHaveBeenCalledOnce()
    })

    it('filters out zero-dimension canvases from a mixed list', async () => {
        const { result } = renderHook(() => usePdf())
        const onSave = vi.fn()

        await act(async () => {
            await result.current.exportCanvases(
                [
                    { canvas: makeCanvas(0, 300) },  // filtered
                    { canvas: makeCanvas() },          // kept
                    { canvas: makeCanvas(200, 0) },   // filtered
                ],
                { onSave },
            )
        })

        expect(mockAddImage).toHaveBeenCalledTimes(1)
        expect(mockAddPage).not.toHaveBeenCalled()
    })

    it('defaults to landscape orientation', async () => {
        const { result } = renderHook(() => usePdf())
        await act(async () => {
            await result.current.exportCanvases([{ canvas: makeCanvas() }], { onSave: vi.fn() })
        })
        expect(mockJsPDF).toHaveBeenCalledWith(expect.objectContaining({ orientation: 'landscape' }))
    })

    it('respects an explicit portrait orientation', async () => {
        const { result } = renderHook(() => usePdf())
        await act(async () => {
            await result.current.exportCanvases(
                [{ canvas: makeCanvas() }],
                { onSave: vi.fn(), orientation: 'portrait' },
            )
        })
        expect(mockJsPDF).toHaveBeenCalledWith(expect.objectContaining({ orientation: 'portrait' }))
    })

    it('creates a download anchor when no onSave is provided', async () => {
        const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
        const { result } = renderHook(() => usePdf())

        await act(async () => {
            await result.current.exportCanvases([{ canvas: makeCanvas() }], { fileName: 'dl' })
        })

        // Anchor was clicked — revoke timing is useDownload's concern, tested separately.
        expect(clickSpy).toHaveBeenCalledOnce()
        expect(URL.createObjectURL).toHaveBeenCalledOnce()
        clickSpy.mockRestore()
    })
})
