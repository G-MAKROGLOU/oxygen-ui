import React, { useId } from 'react'
import { Field, fieldShell, type FieldSize } from './_field'

export interface TextInputProps {
    value?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    disabled?: boolean
    label?: React.ReactNode
    htmlFor?: string
    placeholder?: string
    name?: string
    /** Native input type. Defaults to `'text'`. */
    type?: 'text' | 'email' | 'url' | 'tel'
    inputStyle?: React.CSSProperties
    style?: React.CSSProperties
    /** Label/input orientation. Defaults to `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    /** Size preset — controls height, padding, and font. Default `'md'`. */
    size?: FieldSize
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    errorMessage?: React.ReactNode
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Mark the field required (renders an asterisk after the label). */
    required?: boolean
    /** Optional leading adornment (icon / prefix). */
    prefix?: React.ReactNode
    /** Optional trailing adornment (icon / suffix / unit). */
    suffix?: React.ReactNode
    id?: string
}

/**
 * Single-line text input. Full-width by default (responsive) — constrain it
 * with the parent layout or `style={{ maxWidth }}`. Supports an optional
 * leading `prefix` and trailing `suffix` adornment (icon, unit, etc.).
 *
 * @example
 * ```tsx
 * <TextInput label="Vessel name" value={name} onChange={(e) => setName(e.target.value)} />
 * ```
 *
 * @example With adornment + error
 * ```tsx
 * <TextInput
 *   label="IMO"
 *   prefix={<HashIcon />}
 *   value={imo}
 *   onChange={onChange}
 *   errorMessage={touched && !valid ? 'Invalid IMO number' : undefined}
 * />
 * ```
 */
export default function TextInput({
    value,
    onChange,
    disabled,
    label,
    htmlFor,
    placeholder,
    name,
    type = 'text',
    inputStyle,
    style,
    layout = 'vertical',
    size = 'md',
    onBlur,
    errorMessage,
    helperText,
    required,
    prefix,
    suffix,
}: TextInputProps) {
    const errorId = useId()
    const hasError = errorMessage != null
    const hasAdornment = prefix != null || suffix != null

    const input = (
        <input
            autoComplete="off"
            disabled={disabled}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            type={type}
            name={name}
            id={htmlFor}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            placeholder={placeholder ?? ''}
            // When wrapped for adornments, the input is borderless/transparent
            // and the wrapper carries the shell. Otherwise the input IS the shell.
            className={
                hasAdornment
                    ? 'min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed placeholder:text-foreground-muted'
                    : fieldShell({ size, hasError, disabled })
            }
            style={inputStyle}
        />
    )

    return (
        <Field
            label={label}
            htmlFor={htmlFor}
            errorId={errorId}
            errorMessage={errorMessage}
            helperText={helperText}
            layout={layout}
            required={required}
        >
            {hasAdornment ? (
                <div
                    className={`flex items-center ${fieldShell({ size, hasError, disabled, focusWithin: true })}`}
                    style={style}
                >
                    {prefix && <span className="flex-shrink-0 mr-2 text-foreground-muted">{prefix}</span>}
                    {input}
                    {suffix && <span className="flex-shrink-0 ml-2 text-foreground-muted">{suffix}</span>}
                </div>
            ) : (
                input
            )}
        </Field>
    )
}
