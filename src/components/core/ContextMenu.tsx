import React from 'react'
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'

/**
 * A single action in the context menu.
 *
 * - Leaf items (no `children`) call `onClick` when activated.
 * - Parent items (with `children`) open a sub-menu on hover / arrow-right.
 * - `disabled` items render but cannot be activated; screen readers
 *   announce them as disabled.
 */
export interface ContextMenuActionItem {
    key: React.Key
    /** Label shown for the item. May be plain text or a node. */
    value: React.ReactNode
    icon?: React.ReactNode
    /** Fires when the item is activated. Ignored when `children` is set. */
    onClick?: () => void
    /** Optional sub-menu items. */
    children?: ContextMenuActionItem[]
    /** Render as disabled — still visible but not activatable. */
    disabled?: boolean
}

export interface ContextMenuProps {
    /** Top-level items. Each may carry nested `children` for sub-menus. */
    items: ContextMenuActionItem[]
    /**
     * The element that should respond to right-click. The entire React
     * subtree underneath becomes the trigger area. Wrap an existing
     * component / div / image — anything you can right-click on.
     */
    children: React.ReactNode
}

/**
 * Right-click context menu, built on `@radix-ui/react-context-menu`.
 *
 * **Idiomatic usage**: wrap the element that should respond to right-click.
 * Radix handles positioning (avoids viewport edges automatically), keyboard
 * navigation (↑↓ to move, → to open sub-menu, ← to close, Enter to activate,
 * Esc to dismiss), focus management, and portal-based stacking.
 *
 * @example Basic — flat menu
 * ```tsx
 * <ContextMenu
 *   items={[
 *     { key: 'edit',   value: 'Edit',   onClick: () => openEditor() },
 *     { key: 'delete', value: 'Delete', onClick: () => askDelete() },
 *   ]}
 * >
 *   <Card vessel={vessel} />
 * </ContextMenu>
 * ```
 *
 * @example With sub-menu
 * ```tsx
 * <ContextMenu
 *   items={[
 *     {
 *       key: 'export', value: 'Export',
 *       children: [
 *         { key: 'csv',  value: 'as CSV',  onClick: () => exportCsv() },
 *         { key: 'xlsx', value: 'as Excel', onClick: () => exportXlsx() },
 *       ],
 *     },
 *   ]}
 * >
 *   <Table rows={rows} />
 * </ContextMenu>
 * ```
 */
export default function ContextMenu({ items, children }: ContextMenuProps) {
    return (
        <ContextMenuPrimitive.Root>
            <ContextMenuPrimitive.Trigger asChild>
                {children}
            </ContextMenuPrimitive.Trigger>

            <ContextMenuPrimitive.Portal>
                <ContextMenuPrimitive.Content
                    className={CONTENT_CLASSNAME}
                    collisionPadding={8}
                >
                    {items.map((item) => renderItem(item))}
                </ContextMenuPrimitive.Content>
            </ContextMenuPrimitive.Portal>
        </ContextMenuPrimitive.Root>
    )
}

// ── Styling constants — keep markup readable ────────────────────────────────

const CONTENT_CLASSNAME = [
    // Surface — semantic tokens, both modes covered
    'min-w-[180px] rounded-lg border border-border bg-surface shadow-lg',
    'p-1 z-[500000] text-sm text-foreground',
    // Entry animation matches the Tooltip / Dropdown style
    'animate-in fade-in-0 zoom-in-95',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    // Outline reset — Radix handles focus internally
    'focus:outline-none',
].join(' ')

const ITEM_CLASSNAME = [
    'flex items-center justify-between gap-3 rounded-md px-2 py-1.5 cursor-pointer select-none',
    'transition-colors duration-100',
    'data-[highlighted]:bg-accent data-[highlighted]:text-accent-fg',
    'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed data-[disabled]:bg-transparent data-[disabled]:text-foreground-muted',
    'focus:outline-none',
].join(' ')

// ── Item renderer — recursive for sub-menus ─────────────────────────────────

function renderItem(item: ContextMenuActionItem) {
    if (item.children && item.children.length > 0) {
        // Sub-menu: Radix Sub + SubTrigger + SubContent
        return (
            <ContextMenuPrimitive.Sub key={item.key}>
                <ContextMenuPrimitive.SubTrigger
                    disabled={item.disabled}
                    className={ITEM_CLASSNAME}
                >
                    <ContextMenuLabel icon={item.icon} value={item.value} />
                    <ChevronRight />
                </ContextMenuPrimitive.SubTrigger>
                <ContextMenuPrimitive.Portal>
                    <ContextMenuPrimitive.SubContent
                        className={CONTENT_CLASSNAME}
                        sideOffset={2}
                        alignOffset={-4}
                        collisionPadding={8}
                    >
                        {item.children.map((sub) => renderItem(sub))}
                    </ContextMenuPrimitive.SubContent>
                </ContextMenuPrimitive.Portal>
            </ContextMenuPrimitive.Sub>
        )
    }

    return (
        <ContextMenuPrimitive.Item
            key={item.key}
            disabled={item.disabled}
            onSelect={() => item.onClick?.()}
            className={ITEM_CLASSNAME}
        >
            <ContextMenuLabel icon={item.icon} value={item.value} />
        </ContextMenuPrimitive.Item>
    )
}

function ContextMenuLabel({ icon, value }: { icon?: React.ReactNode; value: React.ReactNode }) {
    return (
        <span className="flex items-center gap-2 flex-1 min-w-0">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span className="truncate">{value}</span>
        </span>
    )
}

function ChevronRight() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 flex-shrink-0" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    )
}

// ── Legacy type re-exports ──────────────────────────────────────────────────
// `ContextMenuPosition` was part of the previous coordinate-based API. It
// has no runtime equivalent in the Radix-based rewrite (positioning is
// automatic), but is re-exported as a deprecated alias so older imports
// keep compiling while consumers migrate.

/** @deprecated The Radix rewrite positions the menu automatically — no coordinates needed. */
export interface ContextMenuPosition {
    x: number
    y: number
}
