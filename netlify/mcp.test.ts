// @vitest-environment node
// Protocol smoke test for the /mcp Netlify Function (SDK-based, stateless).
// Lives outside netlify/functions/ so Netlify does not deploy it as a function.
import { describe, it, expect, beforeAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const ROOT = resolve(__dirname, '..')

let handler: (req: Request) => Promise<Response>

beforeAll(async () => {
    // The function imports the generated manifest; generate it first.
    execFileSync(process.execPath, ['scripts/generate-ai-manifest.mjs'], { cwd: ROOT })
    handler = (await import('./functions/mcp')).default
})

const post = (body: unknown, headers: Record<string, string> = {}) =>
    handler(new Request('http://localhost/mcp', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            accept: 'application/json, text/event-stream',
            ...headers,
        },
        body: JSON.stringify(body),
    }))

const json = async (res: Response) => res.json() as Promise<{
    result?: {
        protocolVersion?: string
        serverInfo?: { name: string }
        tools?: Array<{ name: string; inputSchema?: { properties?: Record<string, { type?: string }> } }>
        content?: Array<{ type: string; text: string }>
        isError?: boolean
    }
    error?: { code: number; message: string }
}>

const PROTO = { 'mcp-protocol-version': '2025-06-18' }

describe('mcp function (stateless Streamable HTTP)', () => {
    it('initialize negotiates the requested protocol version', async () => {
        const res = await post({
            jsonrpc: '2.0', id: 1, method: 'initialize',
            params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } },
        })
        expect(res.status).toBe(200)
        expect(res.headers.get('access-control-allow-origin')).toBe('*')
        const b = await json(res)
        expect(b.result?.protocolVersion).toBe('2025-06-18')
        expect(b.result?.serverInfo?.name).toBe('oxygen-ui')
    })

    it('accepts an older protocol version', async () => {
        const b = await json(await post({
            jsonrpc: '2.0', id: 2, method: 'initialize',
            params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '0' } },
        }))
        expect(b.result?.protocolVersion).toBe('2024-11-05')
    })

    it('answers notifications with 202 and no body', async () => {
        const res = await post({ jsonrpc: '2.0', method: 'notifications/initialized' })
        expect(res.status).toBe(202)
    })

    it('serves tools/list on a fresh stateless request, with all 8 tools', async () => {
        const b = await json(await post({ jsonrpc: '2.0', id: 3, method: 'tools/list' }, PROTO))
        const names = (b.result?.tools ?? []).map(t => t.name).sort()
        expect(names).toEqual([
            'compare_components', 'find_component', 'get_app_bootstrap', 'get_component',
            'get_form_binding', 'get_pattern', 'get_token', 'list_components',
        ])
        const gc = b.result?.tools?.find(t => t.name === 'get_component')
        expect(gc?.inputSchema?.properties?.slug?.type).toBe('string')
    })

    it('tools/call get_component serves the generated docs with example imports kept', async () => {
        const b = await json(await post({
            jsonrpc: '2.0', id: 4, method: 'tools/call',
            params: { name: 'get_component', arguments: { slug: 'pdf-viewer' } },
        }, PROTO))
        const text = b.result?.content?.[0]?.text ?? ''
        expect(text).toContain('# PdfViewer')
        expect(text).toContain("import { searchPdfPhrase } from '@geomak/ui/pdf'")
    })

    it('rejects a tools/call with a missing required argument', async () => {
        const b = await json(await post({
            jsonrpc: '2.0', id: 5, method: 'tools/call',
            params: { name: 'get_component', arguments: {} },
        }, PROTO))
        expect(b.result?.isError === true || b.error != null).toBe(true)
    })

    it('rejects an unknown tool', async () => {
        const b = await json(await post({
            jsonrpc: '2.0', id: 6, method: 'tools/call',
            params: { name: 'nope', arguments: {} },
        }, PROTO))
        expect(b.result?.isError === true || b.error != null).toBe(true)
    })

    it('answers OPTIONS preflight with 204 and CORS headers', async () => {
        const res = await handler(new Request('http://localhost/mcp', { method: 'OPTIONS' }))
        expect(res.status).toBe(204)
        expect(res.headers.get('access-control-allow-origin')).toBe('*')
    })

    it('passes array arguments through zod (compare_components)', async () => {
        const b = await json(await post({
            jsonrpc: '2.0', id: 7, method: 'tools/call',
            params: { name: 'compare_components', arguments: { components: ['modal', 'drawer'] } },
        }, PROTO))
        expect(b.result?.content?.[0]?.text).toContain('Modal vs Drawer')
    })

    it('keeps CORS headers on a malformed request', async () => {
        const res = await handler(new Request('http://localhost/mcp', {
            method: 'POST',
            headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
            body: '{not json',
        }))
        expect(res.headers.get('access-control-allow-origin')).toBe('*')
        expect(res.status).toBeGreaterThanOrEqual(400)
    })
})
