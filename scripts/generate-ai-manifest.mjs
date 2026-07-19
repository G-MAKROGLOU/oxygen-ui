#!/usr/bin/env node
// Generates netlify/functions/ai-manifest.json from all component MDX guides.
// Run before netlify dev, or automatically via the build command in netlify.toml.
//
// Usage: node scripts/generate-ai-manifest.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Ordered scan — src/docs takes precedence; co-located MDX files fill gaps
const MDX_DIRS = [
  join(ROOT, 'src', 'docs'),
  join(ROOT, 'src', 'hooks'),
  join(ROOT, 'src', 'form'),
  join(ROOT, 'src', 'components', 'core'),
  join(ROOT, 'src', 'components', 'inputs'),
  join(ROOT, 'src', 'components', 'forms'),
  join(ROOT, 'src', 'components', 'layout'),
  join(ROOT, 'src', 'components', 'marketing'),
]

// ─── Parsers ──────────────────────────────────────────────────────────────────

function extractMeta(content) {
  const m = content.match(/<Meta\s+title="([^"]+)"/)
  return m ? m[1] : null
}

/**
 * Strip Storybook-specific boilerplate from MDX:
 * - import lines
 * - <Meta … /> tag
 * - export const style objects (th, td, td0, tbl and named variants)
 */
function cleanMdx(content) {
  // Normalise BOM and line endings
  const normalised = content.replace(/^﻿/, '').replace(/\r\n/g, '\n')

  const lines = normalised.split('\n')
  const out = []
  let inJsxComment = false

  for (const line of lines) {
    const t = line.trim()

    // Multi-line JSX comment block: {/* ... (start)
    if (t.startsWith('{/*') && !t.endsWith('*/}')) { inJsxComment = true; continue }
    if (inJsxComment) { if (t.endsWith('*/}') || t === '*/}') inJsxComment = false; continue }

    if (t.match(/^\{\/\*.*\*\/\}$/)) continue          // single-line {/* … */}
    if (line.match(/^import\s/)) continue              // import lines
    if (line.match(/^<Meta\s/)) continue               // <Meta … />
    if (line.match(/^export const (th|td|td0|tbl)\d*\s*[=(]/)) continue  // style exports

    out.push(line)
  }

  return out.join('\n').replace(/^\n+/, '').trimEnd()
}

function extractDescription(cleanContent) {
  const lines = cleanContent.split('\n')
  let afterH1 = false
  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('# ')) { afterH1 = true; continue }
    if (afterH1 && t && !t.startsWith('#') && !t.startsWith('<') && !t.startsWith('```') && !t.startsWith('{')) {
      // Strip markdown links and inline code to get plain text
      return t
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`[^`]+`/g, s => s.slice(1, -1))
        .slice(0, 220)
    }
  }
  return ''
}

function slugify(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase → kebab
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ─── Discovery ────────────────────────────────────────────────────────────────

function getMdxFiles() {
  const seen = new Set()
  const files = []

  for (const dir of MDX_DIRS) {
    let entries
    try { entries = readdirSync(dir) } catch { continue }

    for (const entry of entries) {
      if (!entry.endsWith('.mdx')) continue
      const stem = basename(entry, '.mdx')
      if (seen.has(stem)) continue
      seen.add(stem)
      files.push(join(dir, entry))
    }
  }

  return files
}

// ─── Per-file parsing ─────────────────────────────────────────────────────────

function parseFile(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const metaTitle = extractMeta(content)
  if (!metaTitle) return null

  const clean = cleanMdx(content)
  const description = extractDescription(clean)

  // "Data Display/Accordion/Guide" → category="Data Display", name="Accordion"
  // "Hooks/useExcel/Guide"         → category="Hooks",        name="useExcel"
  // "Foundations/Tokens"           → category="Foundations",  name="Tokens"
  const parts = metaTitle.split('/')
  const lastPart = parts.at(-1)
  let name, category

  if (lastPart === 'Guide' && parts.length >= 2) {
    name = parts.at(-2)
    category = parts.slice(0, -2).join(' / ') || 'General'
  } else {
    name = lastPart
    category = parts.slice(0, -1).join(' / ') || 'General'
  }

  return {
    slug: slugify(name),
    name,
    category,
    description,
    content: clean,
  }
}

// ─── Token extraction ─────────────────────────────────────────────────────────

function extractTokens() {
  const src = readFileSync(join(ROOT, 'src', 'tokens', 'index.ts'), 'utf-8')

  const allVars = [...new Set([...src.matchAll(/--[\w-]+/g)].map(m => m[0]))].sort()

  const bucket = prefix => allVars.filter(v => v.startsWith(prefix))

  return {
    all: allVars,
    colors:     bucket('--color-'),
    radius:     bucket('--radius-'),
    shadow:     bucket('--shadow-'),
    motion:     [...bucket('--motion-'), ...bucket('--duration-'), ...bucket('--ease-')],
    typography: [...bucket('--font-'), ...bucket('--text-'), ...bucket('--leading-'), ...bucket('--tracking-')],
    zIndex:     bucket('--z-'),
    density:    [...bucket('--density-'), ...bucket('--height-')],
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const t0 = Date.now()
  console.log('Generating OxygenUI AI manifest…')

  const mdxFiles = getMdxFiles()
  console.log(`  Found ${mdxFiles.length} MDX files`)

  const components = []
  const skipped = []

  for (const filePath of mdxFiles) {
    const result = parseFile(filePath)
    if (!result) { skipped.push(basename(filePath)); continue }
    components.push(result)
  }

  if (skipped.length) console.log(`  Skipped (no <Meta>): ${skipped.join(', ')}`)

  const tokens = extractTokens()

  const manifest = {
    version: '1',
    generated: new Date().toISOString(),
    components,
    tokens,
  }

  const outDir = join(ROOT, 'netlify', '_data')
  mkdirSync(outDir, { recursive: true })
  // Outside netlify/functions so Netlify doesn't try to deploy it as a serverless function
  const outPath = join(outDir, 'ai-manifest.js')
  writeFileSync(outPath, `// AUTO-GENERATED — run: yarn generate-manifest\nexport default ${JSON.stringify(manifest, null, 2)}\n`)

  const size = (JSON.stringify(manifest).length / 1024).toFixed(1)
  console.log(`  ✓ ${components.length} components · ${tokens.all.length} tokens · ${size} KB → ${outPath}`)
  console.log(`  Done in ${Date.now() - t0}ms`)
}

main()
