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
        // In horizontal mode the row layout is [label, input-with-error-column].
        // The error sits under the input ONLY, not spanning the label too.
        // In vertical mode the whole thing is a column.
        <div
            className={`flex ${layout === 'vertical' ? 'flex-col gap-1' : 'flex-row items-start gap-2'}`}
            style={style ?? {}}
        >
            {label && (
                <label
                    style={{ color: labelColor || undefined }}
                    className={`text-sm font-medium ${layout === 'horizontal' ? 'mt-2' : ''} max-content ${!labelColor && 'text-foreground'}`}
                    htmlFor={htmlFor}
                >
                    {label}
                </label>
            )}
            <div className="flex flex-col">
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
                    className={`${hasError ? 'border border-status-error' : 'border border-border'} bg-surface text-foreground p-2 h-9 w-60 rounded-lg disabled:bg-surface-raised disabled:text-foreground-muted disabled:cursor-not-allowed focus:outline-none focus:border-transparent focus:ring-2 focus:ring-accent transition-colors`}
                    style={inputStyle ?? {}}
                    placeholder={placeholder ?? ''}
                />
                {hasError && (
                    <div id={errorId} className="text-status-error text-xs mt-1">
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    )
}
