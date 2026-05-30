import React, { useId } from 'react'
import { Field, fieldShell, type FieldSize } from './_field'

export interface TextInputProps {
    /** Controlled string value. */
    value?: string
    /** Native change handler — read `e.target.value`. */
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    /** Disable interaction and dim the field. */
    disabled?: boolean
    /** Field label rendered above (vertical) or beside (horizontal) the input. */
    label?: React.ReactNode
    /** `id` for the input + the `<label htmlFor>` link. */
    htmlFor?: string
    /** Placeholder shown when the field is empty. */
    placeholder?: string
    /** Native form field name (used for `FormData` serialisation). */
    name?: string
    /** Native input type. Defaults to `'text'`. */
    type?: 'text' | 'email' | 'url' | 'tel'
    /** Inline style applied to the `<input>` element. */
    inputStyle?: React.CSSProperties
    /** Inline style applied to the field shell / adornment wrapper. */
    style?: React.CSSProperties
    /** Label/input orientation. Defaults to `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    /** Size preset — controls height, padding, and font. Default `'md'`. */
    size?: FieldSize
    /** Native blur handler. */
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    /** Validation message — shown under the input; also flags it red + `aria-invalid`. */
    errorMessage?: React.ReactNode
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Mark the field required (renders an asterisk after the label). */
    required?: boolean
    /** Optional leading adornment (icon / prefix). */
    prefix?: React.ReactNode
    /** Optional trailing adornment (icon / suffix / unit). */
    suffix?: React.ReactNode
    /** @deprecated Use `htmlFor`. */
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
