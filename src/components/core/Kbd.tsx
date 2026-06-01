import React from 'react'

export type KbdSize = 'sm' | 'md'

export interface KbdProps {
    /** A single key's label when `keys` is not used. */
    children?: React.ReactNode
    /**
     * A key combination — each entry renders as its own key cap, joined by
     * `separator`. e.g. `['Ctrl', 'K']` → `Ctrl + K`.
     */
    keys?: string[]
    /** Joiner between caps in a combo. Default `'+'`. */
    separator?: React.ReactNode
    /** Size preset. Default `'md'`. */
    size?: KbdSize
    className?: string
    style?: React.CSSProperties
}

const SIZE: Record<KbdSize, string> = {
    sm: 'h-5 min-w-[20px] px-1.5 text-[11px]',
    md: 'h-6 min-w-[24px] px-2 text-xs',
}

const cap =
    'inline-flex items-center justify-center rounded-md border border-border border-b-2 ' +
    'bg-surface-raised font-medium text-foreground-secondary leading-none select-none ' +
    'font-sans shadow-sm'

/**
 * Renders keyboard keys as styled caps — a single key via `children`, or a
 * combination via `keys` (each rendered as its own cap, joined by `separator`).
 *
 * @example
 * <Kbd>Esc</Kbd>
 * <Kbd keys={['Ctrl', 'K']} />
 * <Kbd keys={['⌘', '⇧', 'P']} size="sm" />
 */
export default function Kbd({
    children,
    keys,
    separator = '+',
    size = 'md',
    className = '',
    style,
}: KbdProps) {
    if (keys && keys.length > 0) {
        return (
            <span className={['inline-flex items-center gap-1', className].filter(Boolean).join(' ')} style={style}>
                {keys.map((k, i) => (
                    <React.Fragment key={`${k}-${i}`}>
                        {i > 0 && <span className="text-foreground-muted text-xs select-none">{separator}</span>}
                        <kbd className={[cap, SIZE[size]].join(' ')}>{k}</kbd>
                    </React.Fragment>
                ))}
            </span>
        )
    }

    return (
        <kbd className={[cap, SIZE[size], className].filter(Boolean).join(' ')} style={style}>
            {children}
        </kbd>
    )
}
