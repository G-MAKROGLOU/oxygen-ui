#!/usr/bin/env node
/**
 * Sets up the OxygenUI Claude Code integration.
 * Copies commands + skill to the target scope, and writes the MCP server entry.
 *
 * Usage:
 *   npx --package=@geomak/ui@latest setup-claude             # user scope (default)
 *   npx --package=@geomak/ui@latest setup-claude --scope project
 */

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PACKAGE_ROOT = join(__dirname, '..')

// ─── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const scopeIdx = args.indexOf('--scope')
const scope = scopeIdx !== -1 ? args[scopeIdx + 1] : 'user'

if (scope !== 'user' && scope !== 'project') {
  console.error('Error: --scope must be "user" or "project"')
  process.exit(1)
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const CONSUMER_COMMANDS = [
  'ui-find',
  'ui-lookup',
  'ui-page',
  'ui-bootstrap',
  'ui-form',
  'ui-table',
  'ui-modal',
  'ui-auth-shell',
]

const targetBase  = scope === 'user' ? homedir() : process.cwd()
const claudeDir   = join(targetBase, '.claude')
const commandsDir = join(claudeDir, 'commands')
const skillDir    = join(claudeDir, 'skills', 'oxygen-ui')
const mcpFile     = scope === 'user'
  ? join(claudeDir, 'mcp.json')
  : join(process.cwd(), '.mcp.json')

const srcCommandsDir = join(PACKAGE_ROOT, '.claude', 'commands')
const srcSkillFile   = join(PACKAGE_ROOT, '.claude', 'skills', 'oxygen-ui', 'SKILL.consumer.md')
const srcSkillFallback = join(PACKAGE_ROOT, '.claude', 'skills', 'oxygen-ui', 'SKILL.md')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf-8')) } catch { return null }
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
}

function ok(msg)   { console.log(`  \x1b[32m+\x1b[0m ${msg}`) }
function warn(msg) { console.warn(`  \x1b[33m!\x1b[0m ${msg}`) }
function info(msg) { console.log(`    ${msg}`) }

// ─── Commands ─────────────────────────────────────────────────────────────────

console.log('\nOxygenUI Claude Code setup\n')
console.log(`Scope: ${scope === 'user' ? 'user (~/.claude)' : `project (${process.cwd()})`}\n`)

console.log('Commands:')
mkdirSync(commandsDir, { recursive: true })

for (const name of CONSUMER_COMMANDS) {
  const src  = join(srcCommandsDir, `${name}.md`)
  const dest = join(commandsDir, `${name}.md`)
  if (!existsSync(src)) {
    warn(`source not found, skipping: ${name}.md`)
    continue
  }
  copyFileSync(src, dest)
  ok(`/${name}`)
}

// ─── Skill ────────────────────────────────────────────────────────────────────

console.log('\nSkill:')
mkdirSync(skillDir, { recursive: true })

const skillSrc = existsSync(srcSkillFile) ? srcSkillFile : srcSkillFallback
if (!existsSync(skillSrc)) {
  warn('SKILL.md not found in package, skipping skill')
} else {
  copyFileSync(skillSrc, join(skillDir, 'SKILL.md'))
  ok('/oxygen-ui skill')
}

// ─── MCP server ───────────────────────────────────────────────────────────────

console.log('\nMCP server:')
mkdirSync(dirname(mcpFile), { recursive: true })

const existing = readJson(mcpFile) ?? {}
if (!existing.mcpServers) existing.mcpServers = {}

if (existing.mcpServers['oxygen-ui']) {
  warn('oxygen-ui entry already exists in ' + mcpFile + ', updating URL')
}

existing.mcpServers['oxygen-ui'] = {
  type: 'http',
  url: 'https://oxygenui.com/mcp',
}

writeJson(mcpFile, existing)
ok(`oxygen-ui server -> ${mcpFile}`)

// ─── Done ─────────────────────────────────────────────────────────────────────

console.log('\n\x1b[32mDone.\x1b[0m\n')

if (scope === 'user') {
  info('The commands, skill, and MCP server are now available in every Claude Code session.')
  info('Restart Claude Code (or reload the MCP server list) to pick up the new server.')
} else {
  info('Commands and skill are in .claude/ and the MCP server is in .mcp.json.')
  info('Commit both directories so every team member gets the tooling when they clone.')
  info('')
  info('Each developer still needs Claude Code installed:')
  info('  npm install -g @anthropic-ai/claude-code')
}

console.log()
