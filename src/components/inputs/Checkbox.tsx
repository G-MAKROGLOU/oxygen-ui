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
}: CheckboxProps) {
    // Support legacy `value` prop transparently
    const isChecked = checked ?? value ?? false

    return (
        <div className="flex flex-col gap-1">
            <label
                htmlFor={htmlFor}
                className={[
                    'inline-flex items-center gap-2.5',
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                ].join(' ')}
            >
                <CheckboxPrimitive.Root
                    id={htmlFor}
                    name={name}
                    checked={isChecked}
                    disabled={disabled}
                    onCheckedChange={(c) =>
                        onChange?.({ target: { checked: !!c, id: htmlFor, name } })
                    }
                    className={[
                        // Box
                        'relative flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center',
                        'rounded-sm border transition-colors duration-150',
                        // Unchecked
                        'border-border-strong bg-surface',
                        // Checked
                        'data-[state=checked]:bg-accent data-[state=checked]:border-accent',
                        // Focus
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                        // Disabled
                        'disabled:cursor-not-allowed',
                    ].join(' ')}
                    aria-label={typeof label === 'string' ? label : undefined}
                >
                    <CheckboxPrimitive.Indicator
                        className="flex items-center justify-center data-[state=checked]:animate-check-pop"
                    >
                        {/* Check mark */}
                        <svg
                            width="11"
                            height="9"
                            viewBox="0 0 11 9"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M1 4.5L4 7.5L10 1"
                                stroke="white"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </CheckboxPrimitive.Indicator>
                </CheckboxPrimitive.Root>

                {label && (
                    <span className="text-sm text-foreground-secondary select-none leading-snug">
                        {label}
                    </span>
                )}
            </label>

            {errorMessage && (
                <span className="text-xs text-status-error pl-[26px]">{errorMessage}</span>
            )}
        </div>
    )
}
