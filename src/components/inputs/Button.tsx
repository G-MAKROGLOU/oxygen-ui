import React from 'react'

export interface ButtonProps {
    content?: React.ReactNode
    /** HTML button type attribute */
    buttonType?: 'button' | 'submit' | 'reset'
    /** Visual variant */
    type?: string
    loading?: boolean
    disabled?: boolean
    style?: React.CSSProperties
    icon?: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/**
 * Primary action button.
 *
 * @example
 * <Button content="Save" onClick={handleSave} />
 * <Button content="Submit" buttonType="submit" loading={isPending} />
 */
export default function Button({
    content,
    buttonType = 'button',
    loading,
    disabled,
    style,
    icon,
    onClick,
}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            type={buttonType}
            className="bg-usafa-blue w-60 h-9 outline-offset-2 mt-5 rounded-lg disabled:bg-roman-silver disabled:cursor-not-allowed transition-all duration-300 hover:bg-true-blue active:bg-usafa-blue flex justify-center gap-1 items-center text-white"
            style={style ?? {}}
        >
            {loading ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#fff"
                    className="w-6 h-6 animate-spin"
                >
                    <path
                        fillRule="evenodd"
                        d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z"
                        clipRule="evenodd"
                    />
                </svg>
            ) : icon ? (
                icon
            ) : null}
            {content}
        </button>
    )
}
