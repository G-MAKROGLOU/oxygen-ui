import React, { useId, useLayoutEffect, useRef } from 'react'
import { Field, fieldShell, type FieldSize } from './_field'

export interface TextAreaProps {
    value?: string
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>
    disabled?: boolean
    label?: React.ReactNode
    htmlFor?: string
    placeholder?: string
    name?: string
    /** Label/control orientation. Default `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    /** Size preset — controls text size + padding. Default `'md'`. */
    size?: FieldSize
    /** Visible rows when not auto-growing. Default `4`. */
    rows?: number
    /**
     * Grow the textarea to fit its content instead of scrolling. When set, the
     * field expands between `rows` (min) and `maxRows` (cap, then scrolls).
     */
    autoGrow?: boolean
    /** Max rows when `autoGrow` is on. Default `12`. */
    maxRows?: number
    /** Native maxlength. When set with `showCount`, a live counter renders. */
    maxLength?: number
    /** Show a character counter (uses `maxLength` as the denominator if present). */
    showCount?: boolean
    /** CSS `resize` behaviour. Default `'vertical'` (or `'none'` when autoGrow). */
    resize?: 'none' | 'vertical' | 'horizontal' | 'both'
    errorMessage?: React.ReactNode
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    required?: boolean
    style?: React.CSSProperties
    inputStyle?: React.CSSProperties
}

const LINE_HEIGHT_PX = 21 // ~1.5 × 14px body text

/**
 * Multi-line text input on the shared field foundation. Optional auto-grow
 * (expands with content between `rows` and `maxRows`), character counter, and
 * resize control. Same refined Halo Focus and error handling as the other
 * inputs.
 *
 * @example
 * ```tsx
 * <TextArea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} autoGrow />
 * ```
 *
 * @example With counter
 * ```tsx
 * <TextArea label="Bio" maxLength={280} showCount value={bio} onChange={onChange} />
 * ```
 */
export default function TextArea({
    value,
    onChange,
    onBlur,
    disabled,
    label,
    htmlFor,
    placeholder,
    name,
    layout = 'vertical',
    size = 'md',
    rows = 4,
    autoGrow = false,
    maxRows = 12,
    maxLength,
    showCount = false,
    resize,
    errorMessage,
    helperText,
    required,
    style,
    inputStyle,
}: TextAreaProps) {
    const errorId = useId()
    const hasError = errorMessage != null
    const ref = useRef<HTMLTextAreaElement>(null)

    // Auto-grow: recompute height on value change, clamped to maxRows.
    useLayoutEffect(() => {
        if (!autoGrow) return
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        const maxH = maxRows * LINE_HEIGHT_PX + 16 // + vertical padding
        el.style.height = `${Math.min(el.scrollHeight, maxH)}px`
        el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden'
    }, [value, autoGrow, maxRows])

    const count = typeof value === 'string' ? value.length : 0
    const resizeClass =
        (resize ?? (autoGrow ? 'none' : 'vertical')) === 'none' ? 'resize-none'
        : (resize ?? 'vertical') === 'horizontal' ? 'resize-x'
        : (resize ?? 'vertical') === 'both' ? 'resize'
        : 'resize-y'

    return (
        <Field
            label={label}
            htmlFor={htmlFor}
            errorId={errorId}
            errorMessage={errorMessage} helperText={helperText}
            layout={layout}
            required={required}
        >
            <textarea
                ref={ref}
                disabled={disabled}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                id={htmlFor}
                rows={rows}
                maxLength={maxLength}
                placeholder={placeholder ?? ''}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorId : undefined}
                className={`${fieldShell({ size, hasError, disabled, sized: false })} px-3 py-2 leading-normal ${resizeClass}`}
                style={{ ...style, ...inputStyle }}
            />
            {showCount && (
                <div className="mt-1 text-right text-xs text-foreground-muted tabular-nums">
                    {maxLength != null ? `${count} / ${maxLength}` : count}
                </div>
            )}
        </Field>
    )
}
