import React, { useId } from 'react'

export interface TextInputProps {
    value?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    disabled?: boolean
    label?: React.ReactNode
    htmlFor?: string
    placeholder?: string
    name?: string
    inputStyle?: React.CSSProperties
    style?: React.CSSProperties
    /** Label/input orientation. Defaults to `'horizontal'`. */
    layout?: 'horizontal' | 'vertical'
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    errorMessage?: React.ReactNode
    labelColor?: string
    id?: string
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
    // `useId` gives us a stable, SSR-safe id for the error region so that
    // `aria-describedby` on the input can point at it. The id only matters
    // when an error is actually being announced.
    const errorId = useId()
    const hasError = errorMessage != null

    return (
        <div className="relative flex flex-col items-center justify-center">
            <div
                className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row items-center gap-2'}`}
                style={style ?? {}}
            >
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
                <input
                    autoComplete="off"
                    disabled={disabled}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    type="text"
                    name={name}
                    id={htmlFor}
                    aria-invalid={hasError || undefined}
                    aria-describedby={hasError ? errorId : undefined}
                    className={`${hasError ? 'border border-error' : ''} focus:outline-oxford-blue-700-opaque p-2 h-9 w-60 outline-offset-2 text-prussian-blue mt-1 rounded-lg disabled:bg-disabled disabled:cursor-not-allowed transition-all`}
                    style={inputStyle ?? {}}
                    placeholder={placeholder ?? ''}
                />
            </div>
            {/* Error region is keyed to the input via aria-describedby. Only
                rendered when there is an actual error so screen readers don't
                read empty descriptions. */}
            {hasError && (
                <div id={errorId} className="text-center text-error dark:text-prussian-blue min-h-0">
                    {errorMessage}
                </div>
            )}
        </div>
    )
}
