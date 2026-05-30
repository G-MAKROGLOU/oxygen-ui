import React, { useId, useState } from 'react'
import { Field, fieldShell, FIELD_SIZE, type FieldSize } from './_field'

export interface PasswordProps {
    /** Controlled value. */
    value?: string
    /** Fires when the value changes. */
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    /** Disable interaction and dim the control. */
    disabled?: boolean
    /** Field label, placed above (vertical) or beside (horizontal) the control. */
    label?: React.ReactNode
    /** The control id; the field label links to it for accessibility. */
    htmlFor?: string
    /** Placeholder shown when the field is empty. */
    placeholder?: string
    /** Native form field name (used for FormData serialisation). */
    name?: string
    /** Inline style applied to the inner input element. */
    inputStyle?: React.CSSProperties
    /** Inline style applied to the control shell. */
    style?: React.CSSProperties
    /** Label/input orientation. Defaults to `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    /** Size preset — controls height, padding, and font. Default `'md'`. */
    size?: FieldSize
    /** Blur handler — useful for touched/validation timing. */
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    /** Validation message — shown under the control; also flags it red and sets aria-invalid. */
    errorMessage?: React.ReactNode
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Show a required asterisk after the label. */
    required?: boolean
    /** Override the "reveal" (password hidden) icon. */
    showIcon?: React.ReactNode
    /** Override the "hide" (password visible) icon. */
    hideIcon?: React.ReactNode
}

const EyeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
    </svg>
)

const EyeSlashIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
    </svg>
)

/**
 * Password input with a show/hide reveal toggle. Full-width by default.
 * The reveal/hide icons can be overridden via `showIcon` / `hideIcon`.
 *
 * @example
 * ```tsx
 * <Password label="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
 * ```
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
    layout = 'vertical',
    size = 'md',
    onBlur,
    errorMessage,
    helperText,
    required,
    showIcon,
    hideIcon,
}: PasswordProps) {
    const [visible, setVisible] = useState(false)
    const errorId = useId()
    const hasError = errorMessage != null

    return (
        <Field
            label={label}
            htmlFor={htmlFor}
            errorId={errorId}
            errorMessage={errorMessage} helperText={helperText}
            layout={layout}
            required={required}
        >
            <div
                className={`flex items-center ${fieldShell({ size, hasError, disabled, focusWithin: true })}`}
                style={style}
            >
                <input
                    autoComplete="off"
                    disabled={disabled}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    type={visible ? 'text' : 'password'}
                    name={name}
                    id={htmlFor}
                    aria-invalid={hasError || undefined}
                    aria-describedby={hasError ? errorId : undefined}
                    placeholder={placeholder ?? ''}
                    className="min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed placeholder:text-foreground-muted"
                    style={inputStyle}
                />
                <button
                    type="button"
                    disabled={disabled}
                    className={`flex-shrink-0 ml-2 ${FIELD_SIZE[size].gap} rounded text-foreground-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed`}
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                >
                    {visible ? (hideIcon ?? EyeSlashIcon) : (showIcon ?? EyeIcon)}
                </button>
            </div>
        </Field>
    )
}
