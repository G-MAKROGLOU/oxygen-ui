/**
 * Shared file-source contract for content components (PdfViewer, Spreadsheet).
 *
 * Three independent, equal ways to supply content — no preference baked in:
 *  1. PROGRAMMATIC  — `ArrayBuffer | Uint8Array` built in-browser (no network)
 *  2. BACKEND       — `string | URL` fetched/streamed from a server
 *  3. LOCAL         — `File | Blob` from a file input / drag-drop (no network)
 */
export type FileSource = string | URL | File | Blob | ArrayBuffer | Uint8Array

export interface RemoteSourceOptions {
    /** Forwarded when `source` is a URL (e.g. an auth token). */
    httpHeaders?: Record<string, string>
    /** Send cookies for same-site auth when `source` is a URL. */
    withCredentials?: boolean
}

/** True when the source is a backend URL (mode 2). */
export function isUrlSource(source: FileSource): source is string | URL {
    return typeof source === 'string' || source instanceof URL
}

/** Normalise a URL-ish source to a string href. */
export function urlHref(source: string | URL): string {
    return typeof source === 'string' ? source : source.href
}

/**
 * Resolve any {@link FileSource} to raw bytes.
 *
 * Modes 1 (ArrayBuffer/Uint8Array) and 3 (File/Blob) resolve **fully
 * client-side — no network**. Mode 2 (URL) is the only one that fetches; the
 * server contract is a plain HTTP GET returning the file bytes, with optional
 * `httpHeaders`/`withCredentials` forwarded.
 */
export async function sourceToBytes(source: FileSource, remote?: RemoteSourceOptions): Promise<Uint8Array> {
    if (source instanceof Uint8Array) return source
    if (source instanceof ArrayBuffer) return new Uint8Array(source)
    if (typeof Blob !== 'undefined' && source instanceof Blob) {
        // Covers both File and Blob — no network.
        return new Uint8Array(await source.arrayBuffer())
    }
    if (isUrlSource(source)) {
        const res = await fetch(urlHref(source), {
            headers: remote?.httpHeaders,
            credentials: remote?.withCredentials ? 'include' : 'same-origin',
        })
        if (!res.ok) throw new Error(`Failed to fetch (${res.status} ${res.statusText})`)
        return new Uint8Array(await res.arrayBuffer())
    }
    throw new Error('Unsupported source type')
}

/** A short human label for a source (used as a default download filename hint). */
export function sourceName(source: FileSource): string | undefined {
    if (typeof File !== 'undefined' && source instanceof File) return source.name
    if (isUrlSource(source)) {
        const href = urlHref(source)
        const last = href.split('?')[0].split('#')[0].split('/').filter(Boolean).pop()
        return last || undefined
    }
    return undefined
}
