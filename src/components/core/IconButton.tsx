import { useMemo } from 'react'

export type IconButtonVariant = 'primary' | 'bordered'

export interface IconButtonProps {
    icon?: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    /** Visual style. Defaults to `'primary'`. */
    type?: IconButtonVariant
    buttonType?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    size?: 'sm' | 'lg'
    loading?: boolean
    loadingIcon?: React.ReactNode
    title?: string
    /** Extra classes appended to the button. */
    className?: string
    /** Inline style on the button. */
    style?: React.CSSProperties
}

/**
 * Square icon-only button.
 *
 * @example
 * <IconButton icon={<Icon.Search />} onClick={doSearch} />
 * <IconButton type="bordered" icon={<Icon.Edit />} />
 */
export default function IconButton({
    icon,
    onClick,
    type = 'primary',
    buttonType = 'button',
    disabled = false,
    size = 'lg',
    loading = false,
    loadingIcon,
    title,
    className = '',
    style,
}: IconButtonProps) {
    const colorScheme = useMemo(() => {
        if (type === 'primary') {
            // Single semantic palette handles both light and dark modes via
            // CSS vars on the consumer's ThemeProvider — no `dark:` variants
            // needed.
            return 'bg-accent text-accent-fg hover:bg-accent-hover'
        }
        if (type === 'bordered') {
            return 'bg-surface text-foreground hover:bg-surface-raised border border-border-strong'
        }
        return ''
    }, [type])

    return (
        <button
            type={buttonType}
            disabled={disabled || loading}
            onClick={onClick}
            title={title}
            aria-label={title}
            style={style}
            className={`${size === 'sm' ? 'p-1' : 'p-2'} rounded-lg shadow-md transition-colors duration-150 ${colorScheme} disabled:bg-surface-raised disabled:text-foreground-muted disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`.trim()}
        >
            {loading ? loadingIcon : icon}
        </button>
    )
}
