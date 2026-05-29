import React, { useId } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Field, type FieldSize } from './_field'

export interface RadioOption {
    /** Stable value submitted / reported on change. */
    value: string
    /** Main label text. */
    label: React.ReactNode
    /** Optional secondary description rendered under the label. */
    description?: React.ReactNode
    /** Disable this option only. */
    disabled?: boolean
}

export interface RadioGroupProps {
    options: RadioOption[]
    /** Controlled selected value. */
    value?: string
    /** Uncontrolled initial value. */
    defaultValue?: string
    onChange?: (value: string) => void
    name?: string
    label?: React.ReactNode
    /**
     * Option arrangement. `'vertical'` (default) stacks options in a column;
     * `'horizontal'` lays them in a row. Named `layout` for consistency with
     * the other inputs.
     */
    layout?: 'vertical' | 'horizontal'
    /**
     * Where each option's label sits relative to its radio dot.
     * `'right'` (default) → dot then label; `'left'` → label then dot.
     */
    labelPosition?: 'left' | 'right'
    /** Size preset — controls the dot + text size. Default `'md'`. */
    size?: FieldSize
    disabled?: boolean
    required?: boolean
    errorMessage?: React.ReactNode
}

const DOT_SIZE: Record<FieldSize, string> = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
}

const TEXT_SIZE: Record<FieldSize, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
}

/**
 * Radio group built on `@radix-ui/react-radio-group`. Each option can carry
 * a `description`, and options can be disabled individually. Radix handles
 * arrow-key roving focus, `role="radiogroup"`, and selection semantics.
 *
 * Form-friendly: pass `name` for native form serialisation, `errorMessage`
 * for validation, `required` for the asterisk + `aria-required`.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   label="Notification frequency"
 *   name="freq"
 *   value={freq}
 *   onChange={setFreq}
 *   options={[
 *     { value: 'realtime', label: 'Real-time', description: 'Notify me immediately' },
 *     { value: 'daily',    label: 'Daily digest' },
 *     { value: 'off',      label: 'Off', disabled: true },
 *   ]}
 * />
 * ```
 */
export default function RadioGroup({
    options,
    value,
    defaultValue,
    onChange,
    name,
    label,
    layout = 'vertical',
    labelPosition = 'right',
    size = 'md',
    disabled,
    required,
    errorMessage,
}: RadioGroupProps) {
    const errorId = useId()
    const groupId = useId()
    const hasError = errorMessage != null
    const labelFirst = labelPosition === 'left'

    return (
        <Field
            label={label}
            htmlFor={groupId}
            errorId={errorId}
            errorMessage={errorMessage}
            required={required}
        >
            <RadioGroupPrimitive.Root
                id={groupId}
                name={name}
                value={value}
                defaultValue={defaultValue}
                onValueChange={onChange}
                disabled={disabled}
                required={required}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorId : undefined}
                orientation={layout}
                className={layout === 'horizontal' ? 'flex flex-row flex-wrap gap-5' : 'flex flex-col gap-3'}
            >
                {options.map((opt) => {
                    const itemId = `${groupId}-${opt.value}`
                    const dot = (
                        <RadioGroupPrimitive.Item
                            id={itemId}
                            value={opt.value}
                            disabled={opt.disabled}
                            className={[
                                DOT_SIZE[size],
                                'mt-0.5 flex-shrink-0 rounded-full border bg-surface transition-colors duration-150',
                                'border-border-strong',
                                'hover:border-accent',
                                'data-[state=checked]:border-accent',
                                // Border-only focus, consistent with the fields.
                                'focus:outline-none focus-visible:border-accent',
                                'disabled:cursor-not-allowed disabled:opacity-50',
                            ].join(' ')}
                        >
                            <RadioGroupPrimitive.Indicator className="flex h-full w-full items-center justify-center">
                                <span className="block h-1/2 w-1/2 rounded-full bg-accent" />
                            </RadioGroupPrimitive.Indicator>
                        </RadioGroupPrimitive.Item>
                    )
                    const labelEl = (
                        <label
                            htmlFor={itemId}
                            className={[
                                'select-none',
                                opt.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                                labelFirst ? 'text-right' : '',
                            ].filter(Boolean).join(' ')}
                        >
                            <span className={`block ${TEXT_SIZE[size]} text-foreground`}>{opt.label}</span>
                            {opt.description && (
                                <span className="block text-xs text-foreground-secondary mt-0.5">
                                    {opt.description}
                                </span>
                            )}
                        </label>
                    )
                    return (
                        <div key={opt.value} className="flex items-start gap-2.5">
                            {labelFirst ? <>{labelEl}{dot}</> : <>{dot}{labelEl}</>}
                        </div>
                    )
                })}
            </RadioGroupPrimitive.Root>
        </Field>
    )
}
