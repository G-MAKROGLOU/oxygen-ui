// OxygenUI MCP server — stateless Netlify Function (Streamable HTTP, POST /mcp)
// Implements the Model Context Protocol JSON-RPC 2.0 subset required for tool-based docs lookup.
// Manifest is generated at build time by: node scripts/generate-ai-manifest.mjs
//
// Registered tools:
//   list_components   — index of all components with slug, category, description
//   get_component     — full MDX docs for a single component by slug
//   find_component    — keyword search across names, categories, descriptions
//   get_token         — lookup CSS custom properties by name or prefix

import MANIFEST from './ai-manifest.json'

// ─── Types ────────────────────────────────────────────────────────────────────

type ManifestComponent = (typeof MANIFEST)['components'][number]

interface JsonRpcRequest {
  jsonrpc: '2.0'
  id?: string | number | null
  method: string
  params?: Record<string, unknown>
}

interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: string | number | null
  result?: unknown
  error?: { code: number; message: string }
}

type TextContent = { type: 'text'; text: string }

// ─── Tool registry ────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'list_components',
    description:
      'List every component, hook, and utility in the OxygenUI (@geomak/ui) design system. ' +
      'Returns each entry\'s slug (for use with get_component), display name, category, and description.',
    inputSchema: { type: 'object', properties: {}, required: [] as string[] },
  },
  {
    name: 'get_component',
    description:
      'Fetch the full documentation for a specific OxygenUI component, hook, or utility — ' +
      'including its props API, usage examples, and recipes. Pass the slug from list_components or find_component.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Component slug, e.g. "accordion", "data-grid", "use-excel", "table", "wizard".',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'find_component',
    description:
      'Search OxygenUI for a component by name, functionality, or keyword. ' +
      'Use this before writing any UI code to discover what the design system already provides.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Free-text query, e.g. "date picker", "virtualized table", "pdf viewer", "form validation".',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_token',
    description:
      'Look up OxygenUI design tokens — CSS custom properties for color, radius, shadow, motion, ' +
      'typography, z-index, and density. Returns matching variable names grouped by category.',
    inputSchema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Token name or category prefix to search, e.g. "--color-accent", "radius", "motion", "shadow", "color".',
        },
      },
      required: ['token'],
    },
  },
] as const

// ─── Tool handlers ────────────────────────────────────────────────────────────

function listComponents(): TextContent[] {
  const lines = MANIFEST.components.map(
    c => `- **${c.name}** · \`${c.slug}\` · _${c.category}_ — ${c.description}`,
  )
  return [{ type: 'text', text: `# OxygenUI Components (${lines.length})\n\n${lines.join('\n')}` }]
}

function getComponent(slug: string): TextContent[] {
  const lower = slug.toLowerCase()
  const hit = MANIFEST.components.find(
    c => c.slug === lower || c.name.toLowerCase() === lower,
  )

  if (!hit) {
    const suggestions = MANIFEST.components
      .filter(c => c.slug.includes(lower) || c.name.toLowerCase().includes(lower))
      .slice(0, 5)
      .map(c => `\`${c.slug}\``)

    const hint = suggestions.length
      ? `\n\nClose matches: ${suggestions.join(', ')}`
      : '\n\nUse `list_components` to browse all available entries.'

    return [{ type: 'text', text: `Component not found: "${slug}"${hint}` }]
  }

  return [{ type: 'text', text: hit.content }]
}

function findComponent(query: string): TextContent[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)

  const scored = MANIFEST.components
    .map(c => {
      const haystack = `${c.name} ${c.category} ${c.description} ${c.slug}`.toLowerCase()
      const score = words.reduce((n, w) => n + (haystack.includes(w) ? 1 : 0), 0)
      return { c, score }
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  if (!scored.length) {
    return [{
      type: 'text',
      text: `No components matched "${query}".\n\nTry different terms, or call \`list_components\` to browse everything.`,
    }]
  }

  const lines = scored.map(
    ({ c }) => `- **${c.name}** · \`${c.slug}\` · _${c.category}_ — ${c.description}`,
  )
  return [{ type: 'text', text: `# Results for "${query}"\n\n${lines.join('\n')}` }]
}

function getToken(token: string): TextContent[] {
  const q = token.toLowerCase().replace(/^--/, '')
  const matches = (MANIFEST.tokens.all as string[]).filter(v => v.replace('--', '').includes(q))

  if (!matches.length) {
    return [{
      type: 'text',
      text:
        `No tokens matched "${token}".\n\n` +
        `Available categories: color, radius, shadow, motion, font, leading, tracking, z, density, height.\n` +
        `Example queries: "--color-accent", "radius", "motion", "shadow".`,
    }]
  }

  // Group by first segment after --
  const grouped = new Map<string, string[]>()
  for (const v of matches) {
    const cat = v.split('-').slice(0, 2).join('-') // e.g. "--color"
    const arr = grouped.get(cat) ?? []
    arr.push(v)
    grouped.set(cat, arr)
  }

  const sections = [...grouped.entries()]
    .map(([cat, vars]) => `### ${cat}\n${vars.map(v => `- \`${v}\``).join('\n')}`)
    .join('\n\n')

  return [{ type: 'text', text: `# Tokens matching "${token}" (${matches.length})\n\n${sections}` }]
}

// ─── JSON-RPC dispatch ────────────────────────────────────────────────────────

function ok(id: string | number | null, result: unknown): JsonRpcResponse {
  return { jsonrpc: '2.0', id, result }
}

function rpcError(id: string | number | null, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: '2.0', id, error: { code, message } }
}

function toolOk(id: string | number | null, content: TextContent[]): JsonRpcResponse {
  return ok(id, { content })
}

async function dispatch(req: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  // Notifications (no id) expect no response
  if (!('id' in req) || req.method.startsWith('notifications/')) return null

  const id = req.id ?? null

  switch (req.method) {
    case 'initialize':
      return ok(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'oxygen-ui', version: '1.0.0' },
      })

    case 'ping':
      return ok(id, {})

    case 'tools/list':
      return ok(id, { tools: TOOLS })

    case 'tools/call': {
      const p = req.params as { name?: string; arguments?: Record<string, string> } | undefined
      if (!p?.name) return rpcError(id, -32602, 'Missing params.name')
      const args = p.arguments ?? {}

      switch (p.name) {
        case 'list_components': return toolOk(id, listComponents())
        case 'get_component':   return toolOk(id, getComponent(args.slug ?? ''))
        case 'find_component':  return toolOk(id, findComponent(args.query ?? ''))
        case 'get_token':       return toolOk(id, getToken(args.token ?? ''))
        default:                return rpcError(id, -32601, `Unknown tool: "${p.name}"`)
      }
    }

    default:
      return rpcError(id, -32601, `Method not found: "${req.method}"`)
  }
}

// ─── HTTP handler ─────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body: JsonRpcRequest
  try {
    body = (await req.json()) as JsonRpcRequest
  } catch {
    return Response.json(
      rpcError(null, -32700, 'Parse error: invalid JSON'),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const result = await dispatch(body)

  if (result === null) {
    return new Response(null, { status: 202, headers: CORS_HEADERS })
  }

  return Response.json(result, {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

export const config = { path: '/mcp' }
