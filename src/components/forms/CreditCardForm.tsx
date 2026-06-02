import React, { useEffect, useRef } from 'react'
import { useForm, Form } from '../../form'
import type { FormValues } from '../../form'
import TextInput from '../inputs/TextInput'
import Button from '../inputs/Button'
import type { FieldSize } from '../inputs/_field'
import {
    type CardBrand,
    detectBrand,
    formatCardNumber,
    formatExpiry,
    onlyDigits,
    cardNumberError,
    expiryError,
    cvvError,
} from './creditCard'

/** The normalised value emitted on change / submit. */
export interface CreditCardValue {
    /** Digits only (no spaces). */
    number: string
    /** Cardholder name. */
    name: string
    /** `MM/YY`. */
    expiry: string
    /** Digits only. */
    cvv: string
    /** Detected brand id (`'visa'`, `'amex'`…) or `null`. */
    brand: string | null
}

export interface CreditCardFormProps {
    /** Called with the validated card once every field passes on submit. */
    onSubmit?: (card: CreditCardValue) => void | Promise<void>
    /** Called on every keystroke with the current (possibly invalid) card. */
    onChange?: (card: CreditCardValue) => void
    /** Seed the fields (uncontrolled). Number/expiry are auto-formatted. */
    defaultValue?: Partial<CreditCardValue>
    /** Size preset for the inner fields. Default `'md'`. */
    size?: FieldSize
    /** Disable every field + the submit button. */
    disabled?: boolean
    /**
     * Disable only the submit button, leaving the fields editable. Useful to
     * gate payment on an external condition (e.g. an empty cart) while still
     * letting the user fill in their card. Combined with `disabled` (either
     * disables the button).
     */
    submitDisabled?: boolean
    /** Require the cardholder name. Default `true`. */
    requireName?: boolean
    /** Hide the built-in submit button (when embedding in a larger form). */
    hideSubmit?: boolean
    /** Submit button label. Default `'Pay'`. */
    submitLabel?: React.ReactNode
    /** Extra classes on the root `<form>`. */
    className?: string
    /** Inline style on the root `<form>`. */
    style?: React.CSSProperties
}

const toCard = (vals: FormValues): CreditCardValue => {
    const number = String(vals.number ?? '')
    return {
        number: onlyDigits(number),
        name: String(vals.name ?? ''),
        expiry: String(vals.expiry ?? ''),
        cvv: onlyDigits(String(vals.cvv ?? '')),
        brand: detectBrand(number)?.id ?? null,
    }
}

/** Small brand badge: a card glyph tinted to the brand + its short code. */
function BrandMark({ brand }: { brand: CardBrand | null }) {
    return (
        <span className="flex items-center gap-1.5" aria-live="polite">
            <svg width="28" height="18" viewBox="0 0 28 18" fill="none" aria-hidden="true">
                <rect x="0.5" y="0.5" width="27" height="17" rx="3" fill="var(--color-surface-raised)" stroke="var(--color-border)" />
                <rect x="0.5" y="3.75" width="27" height="3.5" fill={brand ? brand.color : 'var(--color-border-strong)'} />
            </svg>
            {brand && (
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: brand.color }}>
                    {brand.short}
                </span>
            )}
            <span className="sr-only">{brand ? brand.label : 'Unknown card type'}</span>
        </span>
    )
}

/**
 * Unified credit-card form built on the oxygen-ui {@link useForm} Form API.
 *
 * One component owns all four fields and their cross-field rules — card number
 * (brand detection + grouping + Luhn), expiry (`MM/YY`, real month, not past),
 * CVV (brand-aware length), and cardholder name. It is deliberately NOT shipped
 * as separate inputs: a CVV or expiry field has no meaning outside a card form.
 *
 * Self-contained: render it and handle `onSubmit(card)`; the card is only
 * delivered once everything validates. Use `onChange` for live updates (e.g. a
 * card preview) and `hideSubmit` to embed it inside a larger form.
 *
 * @example
 * <CreditCardForm onSubmit={(card) => pay(card)} submitLabel="Pay $49" />
 */
export default function CreditCardForm({
    onSubmit,
    onChange,
    defaultValue,
    size = 'md',
    disabled,
    submitDisabled,
    requireName = true,
    hideSubmit = false,
    submitLabel = 'Pay',
    className = '',
    style,
}: CreditCardFormProps) {
    // Initial values are read once by useForm; seed (and format) from defaultValue.
    const initial = useRef<FormValues>({
        number: formatCardNumber(defaultValue?.number ?? ''),
        name: defaultValue?.name ?? '',
        expiry: formatExpiry(defaultValue?.expiry ?? ''),
        cvv: onlyDigits(defaultValue?.cvv ?? ''),
    }).current

    const form = useForm({ initialValues: initial })

    const numberStr = String(form.values.number ?? '')
    const brand = detectBrand(numberStr)

    // Live change callback.
    useEffect(() => {
        onChange?.(toCard(form.values))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.values.number, form.values.name, form.values.expiry, form.values.cvv])

    // Base bindings (errorMessage + name + id) — value/onChange are overridden
    // below so we can format keystrokes brand-by-brand.
    const numberBind = form.fieldNative('number', {
        required: 'Card number is required',
        validate: (v) => cardNumberError(String(v)),
    })
    const nameBind = form.fieldNative('name', requireName ? { required: 'Cardholder name is required' } : undefined)
    const expiryBind = form.fieldNative('expiry', {
        required: 'Expiry is required',
        validate: (v) => expiryError(String(v)),
    })
    const cvvBind = form.fieldNative('cvv', {
        required: 'CVV is required',
        validate: (v) => cvvError(String(v), numberStr),
    })

    const cvvLen = brand?.cvv ?? 3

    return (
        <Form
            form={form}
            onFinish={(vals) => onSubmit?.(toCard(vals))}
            className={`flex flex-col gap-4 ${className}`.trim()}
            style={style}
        >
            <TextInput
                {...numberBind}
                label="Card number"
                placeholder="1234 5678 9012 3456"
                size={size}
                disabled={disabled}
                value={numberStr}
                onChange={(e) => form.setValue('number', formatCardNumber(e.target.value), { touch: true })}
                suffix={<BrandMark brand={brand} />}
            />

            <TextInput
                {...nameBind}
                label="Cardholder name"
                placeholder="Jane Appleseed"
                size={size}
                disabled={disabled}
                value={String(form.values.name ?? '')}
                onChange={(e) => form.setValue('name', e.target.value, { touch: true })}
            />

            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <TextInput
                        {...expiryBind}
                        label="Expiry"
                        placeholder="MM/YY"
                        size={size}
                        disabled={disabled}
                        value={String(form.values.expiry ?? '')}
                        onChange={(e) => form.setValue('expiry', formatExpiry(e.target.value), { touch: true })}
                    />
                </div>
                <div className="flex-1">
                    <TextInput
                        {...cvvBind}
                        label="CVV"
                        placeholder={cvvLen === 4 ? '1234' : '123'}
                        size={size}
                        disabled={disabled}
                        value={String(form.values.cvv ?? '')}
                        onChange={(e) => form.setValue('cvv', onlyDigits(e.target.value).slice(0, cvvLen), { touch: true })}
                    />
                </div>
            </div>

            {!hideSubmit && (
                <Button content={submitLabel} buttonType="submit" variant="primary" disabled={disabled || submitDisabled} />
            )}
        </Form>
    )
}
