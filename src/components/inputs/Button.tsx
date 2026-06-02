import React from 'react'

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'content'> {
    /** Button content (text or nodes). */
    content?: React.ReactNode
    /** Visual style variant */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning' | 'success' | 'info'
    /** Size — controls height, padding, and font size */
    size?: 'sm' | 'md' | 'lg'
    /** HTML button type */
    buttonType?: 'button' | 'submit' | 'reset'
    /** Show a loading spinner and disable the control. */
    loading?: boolean
    /** Leading icon — rendered before content */
    icon?: React.ReactNode
    /**
     * @deprecated Pass `variant` instead. Kept for API compat — currently no-op.
     * Will be removed in the next major version.
     */
    type?: string
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: [
        'bg-accent text-accent-fg',
        'hover:bg-accent-hover',
        'active:bg-accent',
        'disabled:bg-foreground-muted disabled:text-accent-fg/70 disabled:cursor-not-allowed',
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    ].join(' '),

    secondary: [
        'bg-transparent border border-accent text-accent',
        'hover:bg-accent hover:text-accent-fg',
        'active:bg-accent-hover active:text-accent-fg',
        'disabled:border-foreground-muted disabled:text-foreground-muted disabled:cursor-not-allowed',
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    ].join(' '),

    // Neutral, flat, hairline-bordered button — the quiet sibling of `secondary`
    // (which carries the accent border). Mirrors the input border behaviour:
    // hairline at rest, strong-hairline on hover. No shadow (flat at rest).
    outline: [
        'bg-surface text-foreground',
        'border border-border hover:border-border-strong',
        'hover:bg-surface-raised',
        'active:bg-surface',
        'disabled:text-foreground-muted disabled:cursor-not-allowed',
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    ].join(' '),

    ghost: [
        'bg-transparent text-foreground-secondary',
        'hover:bg-surface-raised hover:text-foreground',
        'active:bg-surface',
        'disabled:text-foreground-muted disabled:cursor-not-allowed',
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    ].join(' '),

    danger: [
        'bg-status-error text-accent-fg',
        'hover:opacity-90',
        'active:opacity-100',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:ring-2 focus-visible:ring-status-error focus-visible:ring-offset-2',
    ].join(' '),

    warning: [
        'bg-status-warning text-white',
        'hover:opacity-90',
        'active:opacity-100',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:ring-2 focus-visible:ring-status-warning focus-visible:ring-offset-2',
    ].join(' '),

    success: [
        'bg-status-success text-white',
        'hover:opacity-90',
        'active:opacity-100',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:ring-2 focus-visible:ring-status-success focus-visible:ring-offset-2',
    ].join(' '),

    info: [
        'bg-status-info text-white',
        'hover:opacity-90',
        'active:opacity-100',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:ring-2 focus-visible:ring-status-info focus-visible:ring-offset-2',
    ].join(' '),
}

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-7  px-3   text-xs  gap-1   rounded-md',
    md: 'h-9  px-4   text-sm  gap-1.5 rounded-lg',
    lg: 'h-11 px-5   text-sm  gap-2   rounded-xl',
}

/**
 * Primary action button with variant + size system.
 *
 * Width is never hardcoded — set `style={{ width }}` or let the parent grid/flex control it.
 * Uses `React.forwardRef` so it works as a Radix `asChild` trigger (Popover, Tooltip, etc.).
 *
 * @example
 * <Button content="Save" onClick={handleSave} />
 * <Button content="Delete" variant="danger" size="sm" />
 * <Button content="Cancel" variant="secondary" />
 * <Button content="Loading…" loading buttonType="submit" />
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        content,
        variant = 'primary',
        size = 'md',
        buttonType = 'button',
        loading,
        disabled,
        style,
        icon,
        onClick,
        className = '',
        type: _deprecated, // consume deprecated prop — do not spread to DOM
        ...rest
    },
    ref,
) {
    return (
        <button
            // Spread first so named props below take precedence over anything
            // injected by Radix asChild (data-state, aria-*, etc.)
            {...rest}
            ref={ref}
            onClick={onClick}
            disabled={disabled || loading}
            type={buttonType}
            style={style}
            className={[
                'inline-flex items-center justify-center font-medium',
                'outline-none transition-colors duration-150 select-none',
                'whitespace-nowrap',
                SIZE_CLASSES[size],
                VARIANT_CLASSES[variant],
                className,
            ].filter(Boolean).join(' ')}
        >
            {loading ? (
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 animate-spin flex-shrink-0"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z"
                    />
                </svg>
            ) : icon ? (
                <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
            ) : null}
            {content}
        </button>
    )
})

Button.displayName = 'Button'

export default Button
