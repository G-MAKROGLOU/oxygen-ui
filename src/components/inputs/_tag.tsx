import React from 'react'

export interface TagProps {
    children: React.ReactNode
    /** When provided, renders a × button that calls this on click. */
    onRemove?: () => void
    /** Accessible label for the remove button. */
    removeLabel?: string
    disabled?: boolean
}

/**
 * Internal chip used by TagsInput and Dropdown for selected values. Subtle
 * bordered surface (not a heavy accent fill) with an optional × remove
 * button. Kept internal, consumers compose tags through the inputs, not
 * directly.
 */
export default function Tag({ children, onRemove, removeLabel, disabled }: TagProps) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-raised text-foreground text-xs pl-2 pr-1 py-0.5 max-w-full">
            <span className="truncate">{children}</span>
            {onRemove && (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => { e.stopPropagation(); onRemove() }}
                    aria-label={removeLabel ?? 'Remove'}
                    className="inline-flex items-center justify-center w-4 h-4 flex-shrink-0 rounded text-foreground-muted hover:text-status-error hover:bg-surface transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed"
                >
                    <svg width="10" height="10" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </span>
    )
}
