// Bundle-size guard — measures the consumer-facing, minified + gzipped cost of
// key entry points (with peer/runtime deps treated as external, since the
// consumer already ships those) and fails if any exceeds its budget.
//
//   node scripts/size-guard.mjs            # enforce budgets (CI)
//   node scripts/size-guard.mjs --report   # print sizes only, never fail
//
// Run after `yarn build` (it measures the built dist).
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import * as esbuild from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const reportOnly = process.argv.includes('--report')

// Deps the consumer already has — exclude from the measurement.
const external = ['react', 'react-dom', 'react/jsx-runtime', 'framer-motion', '@radix-ui/*']

// name → { entry, imports (ESM names or '*'), limit in KB (gzipped) }
const TARGETS = [
    { name: 'root: import *',        entry: 'dist/index.js',       imports: '*',              limit: 90 },
    { name: 'root: { Button }',      entry: 'dist/index.js',       imports: '{ Button }',     limit: 10 },
    { name: 'root: { Table }',       entry: 'dist/index.js',       imports: '{ Table }',      limit: 14 },
    { name: 'root: { Icon }',        entry: 'dist/index.js',       imports: '{ Icon }',       limit: 20 },
    { name: 'icons: import *',       entry: 'dist/icons/index.js', imports: '*',              limit: 11 },
    { name: 'icons: { ChevronDown }',entry: 'dist/icons/index.js', imports: '{ ChevronDown }',limit: 1 },
    { name: 'tokens: import *',      entry: 'dist/tokens/index.js',imports: '*',              limit: 2.5 },
]

async function measure({ entry, imports }) {
    const ref = imports === '*' ? 'import * as M from' : `import ${imports} from`
    const result = await esbuild.build({
        stdin: { contents: `${ref} './${entry}'\nglobalThis.__keep = ${imports === '*' ? 'M' : imports.replace(/[{}]/g, '').trim()}\n`, resolveDir: root, loader: 'js' },
        bundle: true, minify: true, write: false, format: 'esm', external, logLevel: 'silent',
    })
    return gzipSync(result.outputFiles[0].contents).length
}

const kb = (b) => (b / 1024).toFixed(2)
let failed = false
const rows = []
for (const t of TARGETS) {
    const bytes = await measure(t)
    const over = bytes > t.limit * 1024
    if (over && !reportOnly) failed = true
    rows.push({ Target: t.name, 'Gzip KB': kb(bytes), 'Budget KB': t.limit, Status: over ? '✗ OVER' : '✓' })
}
console.table(rows)
if (failed) {
    console.error('\nBundle-size guard failed — a target exceeded its budget. Investigate the import graph or raise the budget deliberately.')
    process.exit(1)
}
console.log(reportOnly ? '\n(report mode — budgets not enforced)' : '\nAll targets within budget.')
