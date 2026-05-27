import React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'

export interface CheckboxProps {
    /** 'vertical' | 'horizontal' */
    layout?: string
    /** 'left' | 'right' (label side when horizontal) */
    labelPosition?: string
    label?: React.ReactNode
    name?: string
    htmlFor?: string
    errorMessage?: React.ReactNode
    value?: boolean
    onChange?: (e: { target: { value: boolean; id?: string; name?: string } }) => void
    [key: string]: any
}

/**
 * Accessible checkbox powered by Radix Checkbox.
 *
 * Radix handles keyboard activation, focus ring, and ARIA checked state.
 * Emits a synthetic `{ target: { value, id, name } }` event to stay
 * compatible with existing form-change handlers.
 *
 * @example
 * <Checkbox
 *   htmlFor="agree"
 *   label="I agree to the terms"
 *   value={form.agree}
 *   onChange={({ target }) => setField('agree', target.value)}
 * />
 */
export default function Checkbox({
    layout = 'vertical',
    labelPosition = 'left',
    label,
    name,
    htmlFor,
    errorMessage,
    value = false,
    onChange,
}: CheckboxProps) {
    return (
        <div className="p-2">
            <div
                className={`flex ${
                    layout === 'vertical'
                        ? 'flex-col'
                        : labelPosition === 'left'
                        ? 'flex-row'
                        : 'flex-row-reverse'
                } gap-2`}
            >
                <label
                    htmlFor={htmlFor}
                    className="font-bold text-md text-prussian-blue dark:text-white cursor-pointer"
                >
                    {label}
                </label>

                <CheckboxPrimitive.Root
                    id={htmlFor}
                    name={name}
                    checked={value}
                    onCheckedChange={(checked) =>
                        onChange?.({
                            target: { value: !!checked, id: htmlFor, name },
                        })
                    }
                    className="border-2 border-prussian-blue dark:border-independence rounded-md w-6 h-6 flex items-center justify-center cursor-pointer transition-colors duration-150 data-[state=checked]:bg-prussian-blue dark:data-[state=checked]:bg-independence focus:outline-none focus-visible:ring-2 focus-visible:ring-usafa-blue"
                    aria-label={typeof label === 'string' ? label : undefined}
                >
                    <CheckboxPrimitive.Indicator className="transition-transform duration-150 scale-100">
                        {/* Checked icon */}
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M4 10l4.5 4.5L16 6"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </CheckboxPrimitive.Indicator>
                </CheckboxPrimitive.Root>
            </div>
            <div className="text-error text-center">{errorMessage}</div>
        </div>
    )
}
