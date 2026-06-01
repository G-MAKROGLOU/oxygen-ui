import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export type FABPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
export type FABSize = 'md' | 'lg'
export type FABTone = 'accent' | 'neutral'

export interface FABAction {
    icon: React.ReactNode
    /** Accessible label + the text shown on the action's pill. */
    label: string
    onClick?: React.MouseEventHandler
}

export interface FABProps {
    /** Main button icon. */
    icon: React.ReactNode
    /** Accessible label for the main button (required — it's icon-only). */
    label: string
    /** Click handler. Ignored when `actions` is provided (the button toggles the dial). */
    onClick?: React.MouseEventHandler
    /** Speed-dial sub-actions. When set, the main button opens/closes the dial. */
    actions?: FABAction[]
    /** Corner placement. Default `'bottom-right'`. */
    position?: FABPosition
    /** Size preset. Default `'lg'`. */
    size?: FABSize
    /** Colour. Default `'accent'`. */
    tone?: FABTone
    /**
     * `position: fixed` to the viewport (default) or `absolute` to the nearest
     * positioned ancestor — set `false` to anchor inside a `relative` container.
     */
    fixed?: boolean
    className?: string
    style?: React.CSSProperties
}

const POS: Record<FABPosition, string> = {
    'bottom-right': 'bottom-6 right-6 items-end',
    'bottom-left':  'bottom-6 left-6  items-start',
    'top-right':    'top-6 right-6    items-end',
    'top-left':     'top-6 left-6     items-start',
}

const SIZE: Record<FABSize, string> = {
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
}

const TONE: Record<FABTone, string> = {
    accent:  'bg-accent text-accent-fg hover:bg-accent-hover',
    neutral: 'bg-foreground-secondary text-background hover:opacity-90',
}

/**
 * A floating action button. On its own it's a single round action; given
 * `actions`, it becomes a speed dial that expands a labelled stack on click.
 * Positions to a viewport corner by default (or a relative container with
 * `fixed={false}`).
 *
 * @example Single
 * <FAB icon={<PlusIcon />} label="New record" onClick={create} />
 *
 * @example Speed dial
 * <FAB icon={<PlusIcon />} label="Create" actions={[
 *   { icon: <FileIcon />, label: 'Document', onClick: newDoc },
 *   { icon: <FolderIcon />, label: 'Folder', onClick: newFolder },
 * ]} />
 */
export default function FAB({
    icon,
    label,
    onClick,
    actions,
    position = 'bottom-right',
    size = 'lg',
    tone = 'accent',
    fixed = true,
    className = '',
    style,
}: FABProps) {
    const [open, setOpen] = useState(false)
    const reduced = useReducedMotion()
    const hasDial = !!actions && actions.length > 0
    const bottom = position.startsWith('bottom')
    const alignRight = position.endsWith('right')

    const dial = hasDial && (
        <AnimatePresence>
            {open && (
                <motion.ul
                    className={`flex flex-col gap-3 ${bottom ? 'mb-3' : 'mt-3 order-last'} ${alignRight ? 'items-end' : 'items-start'}`}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={{ show: { transition: { staggerChildren: reduced ? 0 : 0.04, staggerDirection: bottom ? -1 : 1 } } }}
                >
                    {actions!.map((a, i) => (
                        <motion.li
                            key={i}
                            className={`flex items-center gap-2 ${alignRight ? 'flex-row' : 'flex-row-reverse'}`}
                            variants={{
                                hidden: { opacity: 0, y: reduced ? 0 : bottom ? 8 : -8, scale: reduced ? 1 : 0.9 },
                                show:   { opacity: 1, y: 0, scale: 1 },
                            }}
                        >
                            <span className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-foreground shadow-md border border-border whitespace-nowrap">
                                {a.label}
                            </span>
                            <button
                                type="button"
                                aria-label={a.label}
                                onClick={(e) => { a.onClick?.(e); setOpen(false) }}
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-foreground-secondary shadow-lg border border-border transition hover:text-foreground hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            >
                                <span className="h-5 w-5 inline-flex items-center justify-center">{a.icon}</span>
                            </button>
                        </motion.li>
                    ))}
                </motion.ul>
            )}
        </AnimatePresence>
    )

    return (
        <div
            className={[fixed ? 'fixed' : 'absolute', 'z-40 flex flex-col', POS[position], className].filter(Boolean).join(' ')}
            style={style}
        >
            {bottom && dial}
            <button
                type="button"
                aria-label={label}
                aria-expanded={hasDial ? open : undefined}
                onClick={(e) => (hasDial ? setOpen((o) => !o) : onClick?.(e))}
                className={[
                    'flex items-center justify-center rounded-full shadow-lg transition-[background-color,transform] duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                    SIZE[size],
                    TONE[tone],
                    hasDial && open ? 'rotate-45' : '',
                ].filter(Boolean).join(' ')}
            >
                <span className="h-6 w-6 inline-flex items-center justify-center">{icon}</span>
            </button>
            {!bottom && dial}
        </div>
    )
}
