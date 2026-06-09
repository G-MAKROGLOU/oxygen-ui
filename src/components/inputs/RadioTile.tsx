import React, { useId } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Field, type FieldSize } from './_field'
import { cx } from '../../utils/cx'

export interface RadioTileOption {
    /** Stable value reported on change / submitted. */
    value: string
    /** Tile title. */
    label: React.ReactNode
    /** Secondary line under the title. */
    description?: React.ReactNode
    /** Leading icon (rendered in the accent colour). */
    icon?: React.ReactNode
    /** Small pill in the top-right corner (e.g. "Popular"). */
    badge?: React.ReactNode
    /** Disable this tile only. */
    disabled?: boolean
}

export interface RadioTileProps {
    options: RadioTileOption[]
    /** Controlled selected value. */
    value?: string
    /** Uncontrolled initial value. */
    defaultValue?: string
    /** Fires when the selection changes. */
    onChange?: (value: string) => void
    /** Native form field name (for `FormData` serialisation). */
    name?: string
    /** Field label above the group. */
    label?: React.ReactNode
    /** Widest-breakpoint column count. Default `2`. */
    columns?: 1 | 2 | 3
    /** Size preset — controls padding + text. Default `'md'`. */
    size?: FieldSize
    /** Disable the whole group. */
    disabled?: boolean
    /** Show a required asterisk + `aria-required`. */
    required?: boolean
    /** Contextual help revealed via an info icon beside the label. */
    helperText?: React.ReactNode
    /** Validation message — shown under the group; flags it red + `aria-invalid`. */
    errorMessage?: React.ReactNode
    className?: string
}

const COLS: Record<1 | 2 | 3, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}

const PAD: Record<FieldSize, string> = { sm: 'p-3', md: 'p-4', lg: 'p-5' }
const TITLE: Record<FieldSize, string> = { sm: 'text-sm', md: 'text-sm', lg: 'text-base' }

const CheckMark = (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 text-accent">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Zm4.28 7.53a.75.75 0 0 0-1.06-1.06l-4.97 4.97-1.97-1.97a.75.75 0 1 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5.5-5.5Z" />
    </svg>
)

/**
 * A single-select group of rich, card-style options — icon, title, description,
 * and an optional corner badge. Built on `@radix-ui/react-radio-group`, so it
 * keeps real radio semantics (roving arrow-key focus, `role="radiogroup"`,
 * native form serialisation via `name`). The selected tile gets an accent
 * border + ring and a check mark.
 *
 * @example
 * <RadioTile
 *   label="Plan"
 *   name="plan"
 *   value={plan}
 *   onChange={setPlan}
 *   columns={3}
 *   options={[
 *     { value: 'starter', label: 'Starter', description: '1 vessel', icon: <BoltIcon /> },
 *     { value: 'pro', label: 'Pro', description: 'Unlimited', icon: <RocketIcon />, badge: 'Popular' },
 *   ]}
 * />
 */
export default function RadioTile({
    options,
    value,
    defaultValue,
    onChange,
    name,
    label,
    columns = 2,
    size = 'md',
    disabled,
    required,
    helperText,
    errorMessage,
    className,
}: RadioTileProps) {
    const groupId = useId()
    const errorId = useId()
    const hasError = errorMessage != null

    return (
        <Field
            className={className}
            label={label}
            htmlFor={groupId}
            errorId={errorId}
            errorMessage={errorMessage}
            required={required}
            helperText={helperText}
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
                className={cx('grid gap-3', COLS[columns])}
            >
                {options.map((opt) => (
                    <RadioGroupPrimitive.Item
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.disabled}
                        className={cx(
                            'group relative flex flex-col gap-1 rounded-xl border bg-surface text-left transition-all duration-150',
                            PAD[size],
                            'border-border hover:border-border-strong',
                            'data-[state=checked]:border-accent data-[state=checked]:ring-1 data-[state=checked]:ring-accent',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                    >
                        <RadioGroupPrimitive.Indicator className="absolute right-3 top-3">
                            {CheckMark}
                        </RadioGroupPrimitive.Indicator>

                        {opt.icon != null && <span className="mb-1 text-accent [&>svg]:h-6 [&>svg]:w-6">{opt.icon}</span>}
                        <span className="flex items-center gap-2 pr-6">
                            <span className={cx('font-semibold text-foreground', TITLE[size])}>{opt.label}</span>
                            {opt.badge != null && (
                                <span className="rounded-full border border-border bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-foreground-secondary">
                                    {opt.badge}
                                </span>
                            )}
                        </span>
                        {opt.description != null && (
                            <span className="text-xs leading-relaxed text-foreground-secondary">{opt.description}</span>
                        )}
                    </RadioGroupPrimitive.Item>
                ))}
            </RadioGroupPrimitive.Root>
        </Field>
    )
}
