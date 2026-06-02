/**
 * `@geomak/ui/icons` — tree-shakeable named icon exports.
 *
 * Deep-import individual icons so your bundler only ships what you use:
 *
 *   import { ChevronDown, Trash, createIcon } from '@geomak/ui/icons'
 *
 * Names here never clash with component names, so the whole pack is available
 * (there's both a `Table` component on the root entry and a `Table` icon here).
 * Prefer this entry in app code; the root `Icon.*` namespace stays available
 * from `@geomak/ui` for quick, discoverable access.
 */
export * from './icons'
export { default as Icon } from './icons'
