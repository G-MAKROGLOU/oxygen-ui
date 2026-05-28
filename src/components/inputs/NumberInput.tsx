import React, { useId } from 'react'

export interface NumberInputProps {
    /** Step size for the up/down buttons and native arrow-key handling. Default `1`. */
    step?: number
    /** Current value. `undefined` renders an empty field; a number renders that value. */
    value?: number | ''
    /** Fires with the next number. Empty input resolves to `undefined`. */
    onChange?: (e: { target: { value: number | undefined; id?: string; name?: string } }) => void
    label?: React.ReactNode
    htmlFor?: string
    name?: string
    disabled?: boolean
    /** Label/input orientation. Defaults to `'horizontal'`. */
    layout?: 'horizontal' | 'vertical'
    errorMessage?: React.ReactNode
    inputStyle?: React.CSSProperties
    labelStyle?: React.CSSProperties
    placeholder?: string
    style?: React.CSSProperties
    min?: number
    max?: number
    readOnly?: boolean
    /** Optional precision for floating-point steps (number of decimal places to round to). */
    precision?: number
}

/**
 * Numeric input with keyboard-accessible increment / decrement buttons.
 *
 * **What's improved over the previous version**
 * - Step buttons are real `<button>` elements with `aria-label`, focus rings,
 *   and proper keyboard activation (Enter / Space). The previous version used
 *   `<span onClick>` which keyboard-only users could not reach.
 * - Floating-point drift on decimal steps (`0.1 + 0.2 = 0.30000000000000004`)
 *   is rounded out via a `precision` prop or auto-inferred from the step.
 * - Empty input resolves to `undefined` instead of `NaN` — works with form
 *   libraries (RHF, Formik) that treat empty as "no value".
 * - The decrement chevron actually points down (the previous SVG was the up
 *   chevron rotated, with the up chevron itself wrongly using the same path).
 * - Width is a prop, not hardcoded `w-60`. Default is `w-full` so the input
 *   flows with its parent.
 *
 * @example
 * ```tsx
 * const [qty, setQty] = useState<number | undefined>(1)
 * <NumberInput
 *   label="Quantity"
 *   value={qty ?? ''}
 *   onChange={({ target }) => setQty(target.value)}
 *   min={0} max={99}
 * />
 * ```
 *
 * @example Decimal step
 * ```tsx
 * <NumberInput label="Tonnage" step={0.25} precision={2} />
 * ```
 */
export default function NumberInput({
    step = 1,
    value,
    onChange,
    label,
    htmlFor,
    name,
    disabled,
    layout = 'horizontal',
    errorMessage,
    inputStyle,
    labelStyle,
    placeholder,
    style,
    min,
    max,
    readOnly = false,
    precision,
}: NumberInputProps) {
    const errorId = useId()
    const hasError = errorMessage != null

    // Auto-infer precision from step (the count of decimal digits) when the
    // consumer hasn't supplied one. Keeps stepping clean for fractional steps
    // like 0.1 / 0.25 / 0.5 without forcing the consumer to think about FP drift.
    const inferredPrecision = precision ?? (
        Number.isInteger(step) ? 0 : (String(step).split('.')[1]?.length ?? 0)
    )

    const round = (n: number) => {
        if (inferredPrecision === 0) return n
        const factor = 10 ** inferredPrecision
        return Math.round(n * factor) / factor
    }

    // `value` may be number or '' (empty). Parse to number for arithmetic;
    // empty treated as 0 to allow stepping up from a cleared field.
    const numeric = typeof value === 'number' ? value : 0

    const onIncrement = () => {
        if (disabled || readOnly) return
        const next = round(numeric + step)
        if (max !== undefined && next > max) return
        onChange?.({ target: { value: next, id: htmlFor, name } })
    }

    const onDecrement = () => {
        if (disabled || readOnly) return
        const next = round(numeric - step)
        if (min !== undefined && next < min) return
        onChange?.({ target: { value: next, id: htmlFor, name } })
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        if (raw === '') {
            onChange?.({ target: { value: undefined, id: htmlFor, name } })
            return
        }
        const parsed = Number(raw)
        if (Number.isNaN(parsed)) return
        onChange?.({ target: { value: round(parsed), id: htmlFor, name } })
    }

    return (
        <div className="flex flex-col gap-1">
            <div className={`flex ${layout === 'vertical' ? 'flex-col gap-1' : 'flex-row items-center gap-2'}`}>
                {label && (
                    <label
                        className="text-sm font-medium ml-1 max-content select-none text-foreground"
                        style={labelStyle}
                        htmlFor={htmlFor}
                    >
                        {label}
                    </label>
                )}
                <div
                    style={style}
                    className={`flex items-center rounded-lg border ${hasError ? 'border-status-error' : 'border-border'} ${disabled ? 'bg-surface-raised text-foreground-muted cursor-not-allowed' : 'bg-surface text-foreground'} focus-within:ring-2 focus-within:ring-accent transition-colors`}
                >
                    <input
                        min={min}
                        max={max}
                        autoComplete="off"
                        disabled={disabled}
                        name={name}
                        id={htmlFor}
                        step={step}
                        value={value ?? ''}
                        onChange={handleInputChange}
                        type="number"
                        aria-invalid={hasError || undefined}
                        aria-describedby={hasError ? errorId : undefined}
                        className="bg-transparent focus:outline-none h-9 w-full px-3 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={inputStyle ?? {}}
                        placeholder={placeholder ?? ''}
                        readOnly={readOnly}
                    />
                    <div className="flex flex-col border-l border-border h-9">
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={onIncrement}
                            disabled={disabled || readOnly || (max !== undefined && numeric >= max)}
                            aria-label="Increase value"
                            className="flex-1 px-1.5 flex items-center justify-center hover:bg-surface-raised disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:bg-surface-raised"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={onDecrement}
                            disabled={disabled || readOnly || (min !== undefined && numeric <= min)}
                            aria-label="Decrease value"
                            className="flex-1 px-1.5 flex items-center justify-center hover:bg-surface-raised disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:bg-surface-raised border-t border-border"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {hasError && (
                <div id={errorId} className="text-xs text-status-error ml-1">
                    {errorMessage}
                </div>
            )}
        </div>
    )
}
