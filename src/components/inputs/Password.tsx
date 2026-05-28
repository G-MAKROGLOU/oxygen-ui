import React, { useState } from 'react'
import COLORS from '../../utils/colors'

export interface PasswordProps {
    value?: any
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    disabled?: boolean
    label?: React.ReactNode
    htmlFor?: string
    placeholder?: string
    name?: string
    inputStyle?: React.CSSProperties
    style?: React.CSSProperties
    layout?: string
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    errorMessage?: React.ReactNode
    labelColor?: string
    iconColor?: string
    [key: string]: any
}

/**
 * Password input with show/hide toggle.
 */
export default function Password({
    value,
    onChange,
    disabled,
    label,
    htmlFor,
    placeholder,
    name,
    inputStyle,
    style,
    layout,
    onBlur,
    errorMessage,
    labelColor,
    iconColor,
}: PasswordProps) {
    const [passwordVisible, setPasswordVisible] = useState(false)
    const color = iconColor ?? COLORS.PALETTE['prussian-blue']

    return (
        <div className="relative flex flex-col items-center justify-center" style={style ?? {}}>
            <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row items-center gap-2'}`}>
                {label && (
                    // Render <label> only when a label is provided. An empty
                    // <label htmlFor=…> announces as an unlabeled control in
                    // some screen readers.
                    <label
                        style={{ color: labelColor || undefined }}
                        className={`text-md font-bold ml-1 max-content ${!labelColor && 'text-prussian-blue dark:text-white'}`}
                        htmlFor={htmlFor}
                    >
                        {label}
                    </label>
                )}
                <div className="flex items-center gap-1">
                    <input
                        autoComplete="off"
                        disabled={disabled}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        type={passwordVisible ? 'text' : 'password'}
                        name={name}
                        id={htmlFor}
                        className={`${errorMessage !== undefined ? 'border border-error' : ''} focus:outline-oxford-blue-700-opaque p-2 h-9 w-52 outline-offset-2 text-prussian-blue mt-1 rounded-lg disabled:bg-disabled disabled:cursor-not-allowed transition-all`}
                        style={inputStyle ?? {}}
                        placeholder={placeholder ?? ''}
                    />
                    <button
                        type="button"
                        className="cursor-pointer p-1"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                    >
                        {passwordVisible ? (
                            /* EyeSlash */
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} className="w-6 h-6">
                                <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                                <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                                <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
                            </svg>
                        ) : (
                            /* Eye */
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} className="w-6 h-6">
                                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            <div className="text-center text-error dark:text-prussian-blue min-h-0">{errorMessage}</div>
        </div>
    )
}
