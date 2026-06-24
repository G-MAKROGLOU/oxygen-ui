import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useExcel } from './useExcel'

// Use the real xlsx (works in Node.js / jsdom) to validate real round-trip.
// Stub the URL/anchor browser APIs so saveBlob (via useDownload) doesn't error in jsdom.
vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:excel-test'),
    revokeObjectURL: vi.fn(),
})

describe('useExcel', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns isExporting=false initially', () => {
        const { result } = renderHook(() => useExcel())
        expect(result.current.isExporting).toBe(false)
    })

    it('exportSheets calls onSave with an xlsx blob and the correct filename', async () => {
        const onSave = vi.fn()
        const { result } = renderHook(() => useExcel())

        await act(async () => {
            await result.current.exportSheets(
                [{ name: 'Sheet1', columns: ['a', 'b'], rows: [{ a: 1, b: 2 }] }],
                { fileName: 'myfile', onSave },
            )
        })

        expect(onSave).toHaveBeenCalledOnce()
        const [blob, name] = onSave.mock.calls[0]
        expect(name).toBe('myfile.xlsx')
        expect(blob).toBeInstanceOf(Blob)
        expect(blob.size).toBeGreaterThan(0)
    })

    it('isExporting is false after export completes', async () => {
        const onSave = vi.fn()
        const { result } = renderHook(() => useExcel())

        await act(async () => {
            await result.current.exportSheets([{ name: 'S', rows: [['x']] }], { onSave })
        })

        expect(result.current.isExporting).toBe(false)
        expect(onSave).toHaveBeenCalledOnce()
    })

    it('accepts array rows directly', async () => {
        const onSave = vi.fn()
        const { result } = renderHook(() => useExcel())

        await act(async () => {
            await result.current.exportSheets(
                [{ name: 'S', columns: ['x', 'y'], rows: [[10, 20], [30, 40]] }],
                { onSave },
            )
        })

        expect(onSave).toHaveBeenCalledOnce()
        const [blob] = onSave.mock.calls[0]
        expect(blob.size).toBeGreaterThan(0)
    })

    it('readWorkbook round-trips a sheet exported by exportSheets', async () => {
        const { result } = renderHook(() => useExcel())

        let capturedBlob: Blob | null = null
        await act(async () => {
            await result.current.exportSheets(
                [{
                    name: 'Fleet',
                    columns: ['vessel', 'dwt'],
                    rows: [
                        { vessel: 'MV Aurora', dwt: 81200 },
                        { vessel: 'MV Borealis', dwt: 115000 },
                    ],
                }],
                { onSave: async (blob) => { capturedBlob = blob } },
            )
        })

        expect(capturedBlob).not.toBeNull()

        let parsed: Awaited<ReturnType<typeof result.current.readWorkbook>>
        await act(async () => {
            parsed = await result.current.readWorkbook(capturedBlob!)
        })

        expect(parsed!).toHaveLength(1)
        expect(parsed![0].name).toBe('Fleet')
        expect(parsed![0].rows).toHaveLength(2)
        expect(parsed![0].rows[0].vessel).toBe('MV Aurora')
        expect(parsed![0].rows[1].dwt).toBe(115000)
    })

    it('readWorkbook handles an empty worksheet gracefully', async () => {
        const { result } = renderHook(() => useExcel())

        // Export a sheet with no rows — just headers
        let capturedBlob: Blob | null = null
        await act(async () => {
            await result.current.exportSheets(
                [{ name: 'Empty', columns: ['col1'], rows: [] }],
                { onSave: async (blob) => { capturedBlob = blob } },
            )
        })

        let parsed: Awaited<ReturnType<typeof result.current.readWorkbook>>
        await act(async () => {
            parsed = await result.current.readWorkbook(capturedBlob!)
        })

        expect(parsed![0].rows).toHaveLength(0)
    })

    it('derives headers from object-row keys when columns is omitted', async () => {
        const onSave = vi.fn()
        const { result } = renderHook(() => useExcel())

        await act(async () => {
            await result.current.exportSheets(
                [{ name: 'Auto', rows: [{ name: 'Alice', score: 99 }] }],
                { onSave },
            )
        })

        // Round-trip to verify headers were written
        const [blob] = onSave.mock.calls[0]
        let parsed: Awaited<ReturnType<typeof result.current.readWorkbook>>
        await act(async () => {
            parsed = await result.current.readWorkbook(blob as Blob)
        })

        expect(Object.keys(parsed![0].rows[0])).toEqual(expect.arrayContaining(['name', 'score']))
        expect(parsed![0].rows[0].name).toBe('Alice')
    })

    it('sanitizes worksheet names longer than 31 chars', async () => {
        const onSave = vi.fn()
        const { result } = renderHook(() => useExcel())

        await act(async () => {
            await result.current.exportSheets(
                [{ name: 'A very long sheet name that exceeds Excel limit', rows: [] }],
                { onSave },
            )
        })

        const [blob] = onSave.mock.calls[0]
        let parsed: Awaited<ReturnType<typeof result.current.readWorkbook>>
        await act(async () => {
            parsed = await result.current.readWorkbook(blob as Blob)
        })

        expect(parsed![0].name.length).toBeLessThanOrEqual(31)
    })
})
