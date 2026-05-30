import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { fieldShell, Field, type FieldSize } from './_field'

export interface TreeSelectNode {
    key: string | number
    label: React.ReactNode
    icon?: React.ReactNode
    /** Nested children. If present, this node is treated as a parent (branch). */
    children?: TreeSelectNode[]
    /** Render the node disabled — visible but not selectable. */
    disabled?: boolean
}

export interface TreeSelectProps {
    /** Tree data. Each node may optionally carry `children` for sub-branches. */
    items: TreeSelectNode[]
    /** Currently selected key (single-select). Pass `undefined`/`null` for unset. */
    value?: string | number | null
    /** Fires with the next selected key (and the corresponding event-like target). */
    onChange?: (e: { target: { value: string | number; id?: string; name?: string } }) => void
    label?: React.ReactNode
    placeholder?: string
    /** Form control id linkage. */
    htmlFor?: string
    name?: string
    /** Label/trigger orientation. Defaults to `'horizontal'`. */
    layout?: 'horizontal' | 'vertical'
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Show a required asterisk after the label. */
    required?: boolean
    disabled?: boolean
    errorMessage?: React.ReactNode
    style?: React.CSSProperties
    /**
     * Whether parent (branch) nodes can be selected. When `false`, parents
     * only expand/collapse and only leaves are picked. Default `true`.
     */
    parentsSelectable?: boolean
    /** Keys of nodes that should start expanded. */
    defaultExpandedKeys?: (string | number)[]
    /** Size preset. Default `'md'`. */
    size?: FieldSize
}

// ── Visible-items flattening ────────────────────────────────────────────────
// Walk the tree depth-first and emit every node along with its depth.
// Children of un-expanded parents are skipped. This array is what the
// keyboard navigation moves through.

interface FlatNode {
    node: TreeSelectNode
    depth: number
    isParent: boolean
}

function flattenVisible(items: TreeSelectNode[], expanded: Set<React.Key>, depth = 0, out: FlatNode[] = []): FlatNode[] {
    for (const node of items) {
        const isParent = !!node.children && node.children.length > 0
        out.push({ node, depth, isParent })
        if (isParent && expanded.has(node.key)) {
            flattenVisible(node.children!, expanded, depth + 1, out)
        }
    }
    return out
}

function findNodeByKey(items: TreeSelectNode[], key: React.Key): TreeSelectNode | null {
    for (const n of items) {
        if (n.key === key) return n
        if (n.children) {
            const found = findNodeByKey(n.children, key)
            if (found) return found
        }
    }
    return null
}

/**
 * Hierarchical single-select with expandable branches.
 *
 * Built on `@radix-ui/react-popover` for portal positioning and click-outside.
 * Tree state (expanded keys) is local; selected value is controlled by the
 * parent.
 *
 * **Keyboard model** (focus is on the trigger or any item):
 * - `Enter` / `Space` / `↓` / `↑` on the trigger — open the popover
 * - `↓` / `↑` — move active item through the visible (un-collapsed) list
 * - `→` — expand a branch (or move into it if already expanded)
 * - `←` — collapse a branch (or move to its parent if already collapsed)
 * - `Enter` / `Space` — select the active item (if selectable)
 * - `Esc` — close the popover, return focus to the trigger
 *
 * @example
 * ```tsx
 * type FleetKey = number
 * const [fleet, setFleet] = useState<FleetKey | null>(null)
 *
 * const tree: TreeSelectNode[] = [
 *   { key: 'eu', label: 'Europe', children: [
 *     { key: 1, label: 'Aegean Fleet' },
 *     { key: 2, label: 'Adriatic Fleet' },
 *   ]},
 *   { key: 'asia', label: 'Asia', children: [{ key: 3, label: 'Pacific Fleet' }] },
 * ]
 *
 * <TreeSelect
 *   label="Fleet"
 *   items={tree}
 *   value={fleet}
 *   onChange={({ target }) => setFleet(target.value as FleetKey)}
 *   parentsSelectable={false}
 * />
 * ```
 */
export default function TreeSelect({
    label,
    name,
    value,
    onChange,
    disabled,
    layout = 'horizontal',
    helperText,
    required,
    errorMessage,
    style,
    htmlFor,
    items = [],
    placeholder = 'Select…',
    parentsSelectable = true,
    defaultExpandedKeys = [],
    size = 'md',
}: TreeSelectProps) {
    const errorId = useId()
    const hasError = errorMessage != null

    const [open, setOpen] = useState(false)
    const [expanded, setExpanded] = useState<Set<React.Key>>(() => new Set(defaultExpandedKeys))
    const [activeIndex, setActiveIndex] = useState(0)

    const listRef = useRef<HTMLDivElement>(null)

    const visible = useMemo(() => flattenVisible(items, expanded), [items, expanded])

    // Sync `activeIndex` only on the open transition (or when `value` changes
    // while open). Previously this ran on every `visible` mutation, so any
    // expand/collapse yanked focus back to the selected item — wrong if the
    // user was navigating to a different branch. We use a ref to track
    // whether we've already done the open-time sync.
    const didSyncOnOpenRef = useRef(false)
    useEffect(() => {
        if (!open) {
            didSyncOnOpenRef.current = false
            return
        }
        if (didSyncOnOpenRef.current) return
        const selectedIdx = visible.findIndex((v) => v.node.key === value)
        setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0)
        didSyncOnOpenRef.current = true
        // visible intentionally excluded — we want to sync ONCE on open,
        // not on every expand/collapse.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, value])

    const selectedNode = useMemo(
        () => (value != null ? findNodeByKey(items, value) : null),
        [items, value],
    )

    // ── Actions ────────────────────────────────────────────────────────────

    const toggleExpand = (key: React.Key) => {
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const selectKey = (key: string | number) => {
        onChange?.({ target: { value: key, id: htmlFor, name } })
        setOpen(false)
    }

    // ── Keyboard handler (on the listbox) ──────────────────────────────────

    const onListKey = (e: React.KeyboardEvent) => {
        if (visible.length === 0) return
        const cur = visible[activeIndex]

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex((i) => Math.min(i + 1, visible.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex((i) => Math.max(i - 1, 0))
        } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            if (cur.isParent) {
                if (!expanded.has(cur.node.key)) toggleExpand(cur.node.key)
                else setActiveIndex((i) => Math.min(i + 1, visible.length - 1))
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault()
            if (cur.isParent && expanded.has(cur.node.key)) {
                toggleExpand(cur.node.key)
            } else if (cur.depth > 0) {
                // Walk back to the nearest ancestor
                for (let i = activeIndex - 1; i >= 0; i--) {
                    if (visible[i].depth < cur.depth) { setActiveIndex(i); break }
                }
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (cur.node.disabled) return
            if (cur.isParent && !parentsSelectable) {
                toggleExpand(cur.node.key)
            } else {
                selectKey(cur.node.key)
            }
        } else if (e.key === 'Escape') {
            e.preventDefault()
            setOpen(false)
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <Field
            label={label}
            htmlFor={htmlFor}
            errorId={errorId}
            errorMessage={errorMessage}
            layout={layout}
            required={required}
            helperText={helperText}
        >
            <div>
                <Popover.Root open={open && !disabled} onOpenChange={(o) => !disabled && setOpen(o)}>
                    <Popover.Trigger asChild>
                        <button
                            id={htmlFor}
                            type="button"
                            style={style}
                            role="combobox"
                            aria-expanded={open}
                            aria-haspopup="listbox"
                            aria-invalid={hasError || undefined}
                            aria-describedby={hasError ? errorId : undefined}
                            disabled={disabled}
                            className={`flex items-center justify-between cursor-pointer select-none ${!style?.width ? 'min-w-[240px]' : ''} ${fieldShell({ size, hasError, disabled })}`}
                        >
                            <span className="text-sm truncate text-left">
                                {selectedNode ? selectedNode.label : <span className="text-foreground-muted">{placeholder}</span>}
                            </span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </Popover.Trigger>

                    <Popover.Portal>
                        <Popover.Content
                            align="start"
                            sideOffset={4}
                            style={{ width: style?.width || 280 }}
                            className="bg-surface text-foreground border border-border rounded-lg shadow-md z-50 p-1 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                            onOpenAutoFocus={(e) => {
                                e.preventDefault()
                                listRef.current?.focus()
                            }}
                        >
                            <div
                                ref={listRef}
                                role="tree"
                                tabIndex={-1}
                                aria-activedescendant={visible[activeIndex] ? `tree-opt-${visible[activeIndex].node.key}` : undefined}
                                onKeyDown={onListKey}
                                className="max-h-72 overflow-y-auto outline-none"
                            >
                                {visible.length === 0 ? (
                                    <div className="px-3 py-4 text-sm text-foreground-secondary text-center">No items</div>
                                ) : (
                                    visible.map((v, idx) => (
                                        <TreeNodeRow
                                            key={v.node.key}
                                            node={v.node}
                                            depth={v.depth}
                                            isParent={v.isParent}
                                            isExpanded={expanded.has(v.node.key)}
                                            isActive={idx === activeIndex}
                                            isSelected={value === v.node.key}
                                            parentsSelectable={parentsSelectable}
                                            onActivate={() => {
                                                if (v.node.disabled) return
                                                if (v.isParent && !parentsSelectable) toggleExpand(v.node.key)
                                                else selectKey(v.node.key)
                                            }}
                                            onToggle={() => toggleExpand(v.node.key)}
                                            onHover={() => setActiveIndex(idx)}
                                        />
                                    ))
                                )}
                            </div>
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
            </div>
        </Field>
    )
}

// ── Row component ───────────────────────────────────────────────────────────

interface RowProps {
    node: TreeSelectNode
    depth: number
    isParent: boolean
    isExpanded: boolean
    isActive: boolean
    isSelected: boolean
    parentsSelectable: boolean
    onActivate: () => void
    onToggle: () => void
    onHover: () => void
}

function TreeNodeRow({
    node, depth, isParent, isExpanded, isActive, isSelected,
    parentsSelectable, onActivate, onToggle, onHover,
}: RowProps) {
    const disabled = node.disabled
    return (
        <div
            id={`tree-opt-${node.key}`}
            role="treeitem"
            aria-selected={isSelected}
            aria-expanded={isParent ? isExpanded : undefined}
            aria-disabled={disabled || undefined}
            data-active={isActive ? '' : undefined}
            onMouseEnter={onHover}
            className={`flex items-center gap-1 rounded-md px-1 py-1.5 select-none cursor-pointer transition-colors duration-100 ${
                disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : isActive
                    ? 'bg-accent text-accent-fg'
                    : isSelected
                    ? 'bg-surface-raised'
                    : 'hover:bg-surface-raised'
            }`}
            style={{ paddingLeft: depth * 16 + 4 }}
        >
            {/* Chevron — only for parents, only toggles expand. Acts as its
                own button so users can expand without selecting. */}
            {isParent ? (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggle() }}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    tabIndex={-1}
                    className="w-5 h-5 inline-flex items-center justify-center rounded hover:bg-black/10 focus:outline-none"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        className={`h-3 w-3 transition-transform duration-150 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            ) : (
                <span className="w-5 h-5 inline-block" aria-hidden="true" />
            )}

            {/* Label — clicking selects (or toggles parents when not selectable) */}
            <button
                type="button"
                onClick={onActivate}
                disabled={disabled}
                tabIndex={-1}
                className="flex-1 flex items-center gap-2 text-sm text-left focus:outline-none disabled:cursor-not-allowed"
            >
                {node.icon}
                <span className="truncate">{node.label}</span>
                {isParent && !parentsSelectable && (
                    <span className="ml-auto text-xs text-foreground-muted">parent</span>
                )}
            </button>

            {/* Selected checkmark */}
            {isSelected && (
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="ml-1">
                    <path d="M4 10l4.5 4.5L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
    )
}
