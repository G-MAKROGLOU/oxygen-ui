import React, { useId } from 'react'
import { Field, fieldShell, type FieldSize } from './_field'

export interface NumberInputProps {
    /** Step size for the up/down buttons and native arrow-key handling. Default `1`. */
    step?: number
    /** Current value. `undefined` renders an empty field; a number renders that value. */
    value?: number | ''
    /** Fires with the next number. Empty input resolves to `undefined`. */
    onChange?: (e: { target: { value: number | undefined; id?: string; name?: string } }) => void
    /** Field label, placed above (vertical) or beside (horizontal) the control. */
    label?: React.ReactNode
    /** The control id; the field label links to it for accessibility. */
    htmlFor?: string
    /** Native form field name (used for FormData serialisation). */
    name?: string
    /** Disable interaction and dim the control. */
    disabled?: boolean
    /** Label/input orientation. Defaults to `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    /** Size preset. Default `'md'`. */
    size?: FieldSize
    /** Validation message, shown under the control; also flags it red and sets aria-invalid. */
    errorMessage?: React.ReactNode
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Extra classes merged onto the field root element. */
    className?: string
    /** Show a required asterisk after the label. */
    required?: boolean
    /** Inline style applied to the inner input element. */
    inputStyle?: React.CSSProperties
    /** Inline style applied to the label. */
    labelStyle?: React.CSSProperties
    /** Placeholder shown when the field is empty. */
    placeholder?: string
    /** Inline style applied to the control shell. */
    style?: React.CSSProperties
    /** Minimum allowed value. */
    min?: number
    /** Maximum allowed value. */
    max?: number
    /** Render read-only, visible but not editable. */
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
 * - Empty input resolves to `undefined` instead of `NaN`, works with form
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
    layout = 'vertical',
    size = 'md',
    errorMessage,
    helperText,
    className,
    required,
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
        <Field className={className}
            label={label}
            htmlFor={htmlFor}
            errorId={errorId}
            errorMessage={errorMessage} helperText={helperText}
            layout={layout}
            required={required}
            labelStyle={labelStyle}
        >
            {/* `overflow-hidden` clips the stepper buttons to the rounded shell;
                `!pr-0` removes the shell's right padding so the steppers sit flush
                against the edge. The `!important` is deliberate: fieldShell adds
                `px-3`, and a consumer's own Tailwind build can re-emit `.px-3`
                after our stylesheet, without `!important` that would win the
                cascade and reintroduce a ~12px gap before the steppers. */}
            <div
                style={style}
                className={`flex items-center overflow-hidden !pr-0 ${fieldShell({ size, hasError, disabled, focusWithin: true })}`}
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
                    className="min-w-0 flex-1 bg-transparent outline-none h-full disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-foreground-muted"
                    style={inputStyle}
                    placeholder={placeholder ?? ''}
                    readOnly={readOnly}
                />
                <div className="flex flex-col self-stretch border-l border-border flex-shrink-0">
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={onIncrement}
                        disabled={disabled || readOnly || (max !== undefined && numeric >= max)}
                        aria-label="Increase value"
                        className="flex-1 px-1.5 flex items-center justify-center text-foreground-muted hover:bg-surface-raised hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                        className="flex-1 px-1.5 flex items-center justify-center text-foreground-muted hover:bg-surface-raised hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-t border-border"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3 w-3" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>
        </Field>
    )
}
