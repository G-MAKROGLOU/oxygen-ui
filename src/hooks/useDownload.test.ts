import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDownload } from './useDownload'

// A minimal valid base64-encoded 1×1 white PNG.
const TINY_PNG_B64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('useDownload', () => {
    let clickSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        vi.stubGlobal('URL', {
            createObjectURL: vi.fn(() => 'blob:test-url'),
            revokeObjectURL: vi.fn(),
        })
        clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
        vi.unstubAllGlobals()
    })

    it('saveBlob and saveFromBase64 are stable across renders', () => {
        const { result, rerender } = renderHook(() => useDownload())
        const { saveBlob: sb1, saveFromBase64: sfb1 } = result.current
        rerender()
        expect(result.current.saveBlob).toBe(sb1)
        expect(result.current.saveFromBase64).toBe(sfb1)
    })

    it('saveBlob creates an object-URL anchor, clicks it, then revokes after a tick', () => {
        const { result } = renderHook(() => useDownload())
        const blob = new Blob(['hello'], { type: 'text/plain' })

        result.current.saveBlob(blob, 'hello.txt')

        expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
        expect(clickSpy).toHaveBeenCalledOnce()
        // Revoke is deferred, not yet called.
        expect(URL.revokeObjectURL).not.toHaveBeenCalled()

        vi.runAllTimers()
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    })

    it('saveBlob sets the correct download filename on the anchor', () => {
        const { result } = renderHook(() => useDownload())
        let capturedHref = ''
        let capturedDownload = ''
        clickSpy.mockImplementation(function (this: HTMLAnchorElement) {
            capturedHref = this.href
            capturedDownload = this.download
        })

        result.current.saveBlob(new Blob(['x']), 'report.pdf')

        expect(capturedDownload).toBe('report.pdf')
        expect(capturedHref).toContain('blob:')
    })

    it('saveFromBase64 decodes a raw base64 payload with an explicit mimeType', () => {
        const { result } = renderHook(() => useDownload())
        result.current.saveFromBase64(TINY_PNG_B64, 'img.png', 'image/png')
        vi.runAllTimers()

        expect(URL.createObjectURL).toHaveBeenCalledOnce()
        const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob
        expect(blob.type).toBe('image/png')
        expect(blob.size).toBeGreaterThan(0)
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    })

    it('saveFromBase64 infers the MIME type from a data-URI prefix', () => {
        const { result } = renderHook(() => useDownload())
        const dataUri = `data:image/png;base64,${TINY_PNG_B64}`
        result.current.saveFromBase64(dataUri, 'img.png')

        const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob
        expect(blob.type).toBe('image/png')
    })

    it('saveFromBase64 explicit mimeType overrides the data-URI inferred type', () => {
        const { result } = renderHook(() => useDownload())
        const dataUri = `data:image/png;base64,${TINY_PNG_B64}`
        result.current.saveFromBase64(dataUri, 'img.webp', 'image/webp')

        const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob
        expect(blob.type).toBe('image/webp')
    })

    it('saveFromBase64 falls back to application/octet-stream when no mime is given or inferred', () => {
        const { result } = renderHook(() => useDownload())
        result.current.saveFromBase64(TINY_PNG_B64, 'data.bin')

        const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob
        expect(blob.type).toBe('application/octet-stream')
    })

    it('saveFromBase64 produces a Blob whose bytes round-trip through atob correctly', () => {
        const { result } = renderHook(() => useDownload())
        // A simple known payload: base64 of 'Hello'
        const b64 = btoa('Hello')
        result.current.saveFromBase64(b64, 'hello.txt', 'text/plain')

        const blob = (URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls[0][0] as Blob
        expect(blob.size).toBe(5) // 'Hello' is 5 bytes
    })
})
