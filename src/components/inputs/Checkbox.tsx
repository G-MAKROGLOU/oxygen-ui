import React, { useId } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { FieldHelpIcon } from './_field'

export interface CheckboxProps {
    /** Controlled checked state. */
    checked?: boolean
    /** Fires `{ target: { checked, id, name } }` for form-handler compatibility. */
    onChange?: (e: { target: { checked: boolean; id?: string; name?: string } }) => void
    /** Primary label text. */
    label?: React.ReactNode
    /** Secondary line rendered under the label (same affordance as RadioGroup options). */
    description?: React.ReactNode
    /** Native form field name. */
    name?: string
    /** `id` for the control and the `<label htmlFor>` link. */
    htmlFor?: string
    /** Validation message, shown under the control; also flags the box red + `aria-invalid`. */
    errorMessage?: React.ReactNode
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Disable interaction + dim the control. */
    disabled?: boolean
    /** Show a required asterisk after the label. */
    required?: boolean
    /**
     * Box + label arrangement.
     * - `'horizontal'` (default): box and label on one row.
     * - `'vertical'`: box and label stacked.
     */
    layout?: 'horizontal' | 'vertical'
    /**
     * Which side of the box the label sits on.
     * - `'right'` (default): box then label.
     * - `'left'`: label then box (the description always wraps under the label).
     */
    labelPosition?: 'left' | 'right'
    /** @deprecated Use `checked`. Kept for API compatibility. */
    value?: boolean
    /** Extra classes merged onto the component root. */
    className?: string
}

/**
 * Accessible checkbox powered by Radix Checkbox.
 *
 * Radix handles keyboard activation, focus ring, and `role="checkbox"` ARIA;
 * the check mark pops in with a spring on first check. Supports a secondary
 * `description`, `helperText` tooltip, left/right label placement, and the
 * shared error treatment, so it lines up with every other input in a form.
 *
 * Emits `{ target: { checked, id, name } }` for drop-in use with existing
 * change handlers.
 *
 * @example
 * <Checkbox
 *   htmlFor="agree"
 *   label="I agree to the terms"
 *   description="You can revoke consent any time in settings."
 *   checked={form.agree}
 *   onChange={({ target }) => setField('agree', target.checked)}
 * />
 */
export default function Checkbox({
    checked,
    value, // legacy alias
    onChange,
    label,
    description,
    name,
    htmlFor,
    errorMessage,
    helperText,
    disabled = false,
    required,
    layout = 'horizontal',
    labelPosition = 'right',
    className = '',
}: CheckboxProps) {
    const isChecked = checked ?? value ?? false
    const labelFirst = labelPosition === 'left'
    const errorId = useId()
    const hasError = errorMessage != null

    const box = (
        <CheckboxPrimitive.Root
            id={htmlFor}
            name={name}
            checked={isChecked}
            disabled={disabled}
            required={required}
            onCheckedChange={(c) => onChange?.({ target: { checked: !!c, id: htmlFor, name } })}
            className={[
                'relative mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center',
                'rounded-sm border transition-colors duration-150',
                hasError ? 'border-status-error' : 'border-border-strong',
                'data-[state=checked]:bg-accent data-[state=checked]:border-accent',
                // Focus halo matches the field tokens for a consistent look.
                'focus:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring',
                'disabled:cursor-not-allowed',
            ].join(' ')}
            aria-label={typeof label === 'string' ? label : undefined}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
        >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center data-[state=checked]:animate-check-pop">
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden="true">
                    <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )

    const labelText = label != null && (
        <label
            htmlFor={htmlFor}
            className={['block select-none text-sm text-foreground leading-snug', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'].join(' ')}
        >
            {label}
            {required && <span className="text-status-error ml-0.5" aria-hidden="true">*</span>}
        </label>
    )
    const descriptionEl = description != null && (
        <label
            htmlFor={htmlFor}
            className={`block text-xs text-foreground-secondary mt-0.5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {description}
        </label>
    )

    // Compose box + label, with the description always wrapping UNDER the label.
    let content: React.ReactNode
    if (layout === 'vertical') {
        content = (
            <span className="flex flex-col items-start gap-1.5">
                {labelFirst ? <>{labelText}{box}</> : <>{box}{labelText}</>}
                {descriptionEl}
            </span>
        )
    } else if (labelFirst) {
        content = (
            <span className="flex flex-col">
                <span className="flex items-start gap-2.5">{labelText}{box}</span>
                {descriptionEl}
            </span>
        )
    } else {
        content = (
            <span className="flex items-start gap-2.5">
                {box}
                <span className="flex flex-col">{labelText}{descriptionEl}</span>
            </span>
        )
    }

    return (
        <div className={`flex flex-col gap-1 ${className}`.trim()}>
            <div className="flex items-start gap-1">
                {content}
                {helperText != null && <FieldHelpIcon text={helperText} />}
            </div>
            {hasError && <span id={errorId} className="text-xs text-status-error mt-0.5">{errorMessage}</span>}
        </div>
    )
}
