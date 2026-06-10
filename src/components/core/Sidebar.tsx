import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Tooltip, { TooltipProvider } from './Tooltip'

/** ─────────────────── types ─────────────────── */

export interface SidebarItem {
    key: string
    /** Leading icon. Optional for nested sub-items (they show a dot instead). */
    icon?: React.ReactNode
    label: string
    isActive?: boolean
    onClick?: () => void
    /** Numeric badge shown on the icon */
    badge?: number
    /**
     * Nested sub-items. When present (and the sidebar is expanded), the item
     * becomes an expandable group with a chevron; clicking toggles the children.
     */
    items?: SidebarItem[]
    /** Start the sub-menu expanded. Defaults to open when a descendant is active. */
    defaultOpen?: boolean
}

export interface SidebarSection {
    key: string
    /** Section title — visible only when expanded */
    title?: string
    items: SidebarItem[]
}

export interface SidebarProps {
    sections: SidebarSection[]
    isExpanded: boolean
    onToggle?: () => void
    /** Expanded sidebar width in px (default 220) */
    expandedWidth?: number
    /** Collapsed sidebar width in px (default 52) */
    collapsedWidth?: number
    /** Slot rendered at the bottom of the sidebar (theme switch, user avatar…) */
    footer?: React.ReactNode
    /** Extra classes merged onto the sidebar root (`<aside>`). */
    className?: string
}

/** ─────────────────── sub-components ─────────────────── */

function NavItem({
    item,
    isExpanded,
    depth = 0,
}: {
    item: SidebarItem
    isExpanded: boolean
    depth?: number
}) {
    const hasChildren = !!(item.items && item.items.length)
    const [open, setOpen] = useState<boolean>(item.defaultOpen ?? (hasChildren && !!item.items?.some((c) => c.isActive)))

    const handleClick = () => {
        if (hasChildren && isExpanded) setOpen((o) => !o)
        item.onClick?.()
    }

    const btn = (
        <button
            type="button"
            onClick={handleClick}
            aria-expanded={hasChildren && isExpanded ? open : undefined}
            style={isExpanded && depth > 0 ? { paddingLeft: 10 + depth * 18 } : undefined}
            className={[
                'group relative flex w-full items-center gap-2.5 rounded-md',
                'px-2.5 py-2 transition-colors duration-100',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
                item.isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-foreground-secondary hover:bg-surface-raised hover:text-foreground',
            ].join(' ')}
        >
            {/* Icon (or a dot for icon-less sub-items) */}
            <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                {item.icon ?? (depth > 0 ? <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" /> : null)}
                {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-status-error text-[9px] font-bold text-white leading-none">
                        {item.badge > 99 ? '99+' : item.badge}
                    </span>
                )}
            </span>

            {/* Label — only visible when expanded */}
            {isExpanded && (
                <motion.span initial={false} animate={{ opacity: 1 }} className="flex-1 truncate text-left text-sm font-medium">
                    {item.label}
                </motion.span>
            )}

            {/* Expand/collapse chevron for groups */}
            {isExpanded && hasChildren && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"
                    className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
            )}

            {/* Active indicator bar (top-level only) */}
            {item.isActive && depth === 0 && (
                <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-full bg-accent" />
            )}
        </button>
    )

    if (!isExpanded) {
        return (
            <Tooltip title={item.label} placement="right" delayDuration={200}>
                {btn}
            </Tooltip>
        )
    }

    if (!hasChildren) return btn

    return (
        <>
            {btn}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="mt-0.5 flex flex-col gap-0.5">
                            {item.items!.map((child) => (
                                <NavItem key={child.key} item={child} isExpanded={isExpanded} depth={depth + 1} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

/** ─────────────────── main component ─────────────────── */

/**
 * Collapsible application sidebar.
 *
 * When collapsed: icon-only with tooltips. When expanded: icon + label.
 * Width animates with an ease-out-expo curve. The parent (AppShell) is
 * responsible for shifting the main content by the sidebar width.
 *
 * @example
 * const [open, setOpen] = useState(true)
 * <Sidebar
 *   sections={NAV_SECTIONS}
 *   isExpanded={open}
 *   onToggle={() => setOpen(o => !o)}
 * />
 */
export default function Sidebar({
    sections,
    isExpanded,
    onToggle,
    expandedWidth  = 220,
    collapsedWidth = 52,
    footer,
    className = '',
}: SidebarProps) {
    return (
        <TooltipProvider delayDuration={200}>
            <motion.aside
                initial={false}
                animate={{ width: isExpanded ? expandedWidth : collapsedWidth }}
                transition={{ type: 'tween', duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex h-full flex-col border-r border-border bg-surface overflow-hidden flex-shrink-0 ${className}`.trim()}
            >
                {/* ── Toggle button ── */}
                <div className={[
                    'flex h-14 flex-shrink-0 items-center border-b border-border',
                    isExpanded ? 'justify-between px-3' : 'justify-center px-1.5',
                ].join(' ')}>
                    {isExpanded && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.08 }}
                            className="text-xs font-semibold uppercase tracking-widest text-foreground-muted select-none"
                        >
                            Menu
                        </motion.span>
                    )}
                    <Tooltip title={isExpanded ? 'Collapse menu' : 'Expand menu'} placement="right" delayDuration={500}>
                        <button
                            type="button"
                            onClick={onToggle}
                            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-raised hover:text-foreground transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                            <motion.svg
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                                animate={{ rotate: isExpanded ? 0 : 180 }}
                                transition={{ type: 'tween', duration: 0.22 }}
                            >
                                <path d="M13 5l-5 5 5 5" />
                            </motion.svg>
                        </button>
                    </Tooltip>
                </div>

                {/* ── Nav items ── */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1.5 space-y-0.5">
                    {sections.map((section, si) => (
                        <div key={section.key} className={si > 0 ? 'pt-3' : ''}>
                            {/* Section title — hidden when collapsed */}
                            {section.title && isExpanded && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.06 }}
                                    className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-foreground-muted select-none"
                                >
                                    {section.title}
                                </motion.p>
                            )}
                            {section.items.map((item) => (
                                <NavItem key={item.key} item={item} isExpanded={isExpanded} />
                            ))}
                        </div>
                    ))}
                </nav>

                {/* ── Footer slot ── */}
                {footer && (
                    <div className={[
                        'flex flex-shrink-0 items-center border-t border-border py-2',
                        isExpanded ? 'px-3 gap-2' : 'justify-center px-1.5',
                    ].join(' ')}>
                        {footer}
                    </div>
                )}
            </motion.aside>
        </TooltipProvider>
    )
}
