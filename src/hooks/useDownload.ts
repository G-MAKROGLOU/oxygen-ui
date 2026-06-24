import { useCallback } from 'react'

export interface UseDownloadReturn {
    /** Trigger a browser download of a Blob. */
    saveBlob: (blob: Blob, fileName: string) => void
    /**
     * Decode a base64 string and download it as a file.
     * Accepts a raw base64 payload OR a full `data:<mime>;base64,<payload>` URI.
     * @param mimeType MIME for the Blob. Inferred from a data-URI prefix when
     *   present, else 'application/octet-stream'.
     */
    saveFromBase64: (base64: string, fileName: string, mimeType?: string) => void
}

export function useDownload(): UseDownloadReturn {
    const saveBlob = useCallback((blob: Blob, fileName: string) => {
        if (typeof window === 'undefined') return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        // Defer the revoke so the click registers before the URL is released.
        setTimeout(() => URL.revokeObjectURL(url), 0)
    }, [])

    const saveFromBase64 = useCallback((base64: string, fileName: string, mimeType?: string) => {
        let payload = base64
        let inferredMime: string | undefined

        if (base64.startsWith('data:')) {
            const commaIdx = base64.indexOf(',')
            if (commaIdx !== -1) {
                const header = base64.slice(5, commaIdx) // everything after 'data:' up to ','
                const semiIdx = header.indexOf(';')
                if (semiIdx !== -1) inferredMime = header.slice(0, semiIdx)
                payload = base64.slice(commaIdx + 1)
            }
        }

        const binary = atob(payload)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

        const blob = new Blob([bytes], { type: mimeType ?? inferredMime ?? 'application/octet-stream' })
        saveBlob(blob, fileName)
    }, [saveBlob])

    return { saveBlob, saveFromBase64 }
}
