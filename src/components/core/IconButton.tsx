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
}: IconButtonProps) {
    const colorScheme = useMemo(() => {
        if (type === 'primary') {
            return 'hover:bg-true-blue bg-usafa-blue dark:bg-independence dark:hover:bg-black-coral'
        }
        if (type === 'bordered') {
            return 'bg-ice hover:bg-ice-dark border border-prussian-blue disabled:border-disabled'
        }
        return ''
    }, [type])

    return (
        <button
            type={buttonType}
            disabled={disabled || loading}
            onClick={onClick}
            className={`${size === 'sm' ? 'p-1' : 'p-2'} rounded-lg shadow-lg transition-all duration-150 ${colorScheme} dark:disabled:bg-manatee disabled:bg-disabled disabled:cursor-not-allowed`}
        >
            {loading ? loadingIcon : icon}
        </button>
    )
}
