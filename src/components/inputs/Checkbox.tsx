import React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'

export interface CheckboxProps {
    /** Controlled checked state */
    checked?: boolean
    onChange?: (e: { target: { checked: boolean; id?: string; name?: string } }) => void
    label?: React.ReactNode
    name?: string
    /** `id` for the hidden input and the `<label htmlFor>` link */
    htmlFor?: string
    errorMessage?: React.ReactNode
    disabled?: boolean
    /**
     * Box + label arrangement.
     * - `'horizontal'` (default): box and label on one row.
     * - `'vertical'`: box and label stacked.
     */
    layout?: 'horizontal' | 'vertical'
    /**
     * Where the label sits relative to the box.
     * - In horizontal: `'right'` (default) → box then label; `'left'` → label then box.
     * - In vertical: `'right'` (default) → box then label below; `'left'` → label above then box.
     */
    labelPosition?: 'left' | 'right'
    /** @deprecated Use `checked` */
    value?: boolean
}

/**
 * Accessible checkbox powered by Radix Checkbox.
 *
 * Radix handles keyboard activation, focus ring, and `role="checkbox"` ARIA.
 * The check mark pops in with a spring animation on first check.
 *
 * @example
 * <Checkbox
 *   htmlFor="agree"
 *   label="I agree to the terms"
 *   checked={form.agree}
 *   onChange={({ target }) => setField('agree', target.checked)}
 * />
 */
export default function Checkbox({
    checked,
    value,           // legacy alias
    onChange,
    label,
    name,
    htmlFor,
    errorMessage,
    disabled = false,
    layout = 'horizontal',
    labelPosition = 'right',
}: CheckboxProps) {
    // Support legacy `value` prop transparently
    const isChecked = checked ?? value ?? false
    const labelFirst = labelPosition === 'left'

    const box = (
        <CheckboxPrimitive.Root
            id={htmlFor}
            name={name}
            checked={isChecked}
            disabled={disabled}
            onCheckedChange={(c) =>
                onChange?.({ target: { checked: !!c, id: htmlFor, name } })
            }
            className={[
                'relative flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center',
                'rounded-sm border transition-colors duration-150',
                'border-border-strong bg-surface',
                'data-[state=checked]:bg-accent data-[state=checked]:border-accent',
                // Focus halo matches the field tokens for a consistent look.
                'focus:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-ring',
                'disabled:cursor-not-allowed',
            ].join(' ')}
            aria-label={typeof label === 'string' ? label : undefined}
        >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center data-[state=checked]:animate-check-pop">
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden="true">
                    <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )

    const labelEl = label && (
        <span className="text-sm text-foreground-secondary select-none leading-snug">
            {label}
        </span>
    )

    return (
        <div className="flex flex-col gap-1">
            <label
                htmlFor={htmlFor}
                className={[
                    'inline-flex',
                    layout === 'vertical' ? 'flex-col items-start gap-1.5' : 'flex-row items-center gap-2.5',
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                ].join(' ')}
            >
                {labelFirst ? <>{labelEl}{box}</> : <>{box}{labelEl}</>}
            </label>

            {errorMessage && (
                <span className="text-xs text-status-error mt-0.5">{errorMessage}</span>
            )}
        </div>
    )
}
