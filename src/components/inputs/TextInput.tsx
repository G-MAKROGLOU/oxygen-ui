import React from 'react'

export interface TextInputProps {
    value?: any
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    disabled?: boolean
    label?: React.ReactNode
    htmlFor?: string
    placeholder?: string
    name?: string
    inputStyle?: React.CSSProperties
    style?: React.CSSProperties
    /** 'horizontal' | 'vertical' */
    layout?: string
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    errorMessage?: React.ReactNode
    labelColor?: string
    id?: string
    [key: string]: any
}

/**
 * Standard text input with label and validation message.
 */
export default function TextInput({
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
}: TextInputProps) {
    return (
        <div className="relative flex flex-col items-center justify-center">
            <div
                className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row items-center gap-2'}`}
                style={style ?? {}}
            >
                <label
                    style={{ color: labelColor || undefined }}
                    className={`text-md font-bold ml-1 max-content ${!labelColor && 'text-prussian-blue dark:text-white'}`}
                    htmlFor={htmlFor}
                >
                    {label}
                </label>
                <input
                    autoComplete="off"
                    disabled={disabled}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    type="text"
                    name={name}
                    id={htmlFor}
                    className={`${errorMessage !== undefined ? 'border border-error' : ''} focus:outline-oxford-blue-700-opaque p-2 h-9 w-60 outline-offset-2 text-prussian-blue mt-1 rounded-lg disabled:bg-disabled disabled:cursor-not-allowed transition-all`}
                    style={inputStyle ?? {}}
                    placeholder={placeholder ?? ''}
                />
            </div>
            <div className="text-center text-error dark:text-prussian-blue min-h-0">
                {errorMessage}
            </div>
        </div>
    )
}
