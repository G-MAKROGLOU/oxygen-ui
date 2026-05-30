import React, { useId, useRef } from 'react'
import { Field, type FieldSize } from './_field'

export interface OtpInputProps {
    /** Number of code boxes. Default `6`. */
    length?: number
    value?: string
    onChange?: (code: string) => void
    /** Fired when every box is filled. */
    onComplete?: (code: string) => void
    label?: React.ReactNode
    htmlFor?: string
    name?: string
    /** `'numeric'` (default) restricts to digits; `'alphanumeric'` allows letters too. */
    mode?: 'numeric' | 'alphanumeric'
    /** Render boxes as masked dots (for PIN entry). */
    masked?: boolean
    size?: FieldSize
    disabled?: boolean
    errorMessage?: React.ReactNode
    required?: boolean
    /** Label/control orientation. Default `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Render a visual gap after this many boxes (e.g. `3` → `123 456`). */
    groupAfter?: number
}

const BOX_SIZE: Record<FieldSize, string> = {
    sm: 'h-9 w-8 text-sm',
    md: 'h-11 w-10 text-base',
    lg: 'h-14 w-12 text-lg',
}

/**
 * Segmented one-time-code / PIN input. Auto-advances as the user types,
 * Backspace retreats, and pasting a code spreads it across the boxes. Set
 * `masked` for PIN entry, `mode="alphanumeric"` for letter codes.
 *
 * @example
 * ```tsx
 * <OtpInput length={6} value={code} onChange={setCode} onComplete={verify} />
 * ```
 */
export default function OtpInput({
    length = 6,
    value = '',
    onChange,
    onComplete,
    label,
    htmlFor,
    name,
    mode = 'numeric',
    masked = false,
    size = 'md',
    disabled,
    errorMessage,
    required,
    layout = 'vertical',
    helperText,
    groupAfter,
}: OtpInputProps) {
    const errorId = useId()
    const hasError = errorMessage != null
    const refs = useRef<(HTMLInputElement | null)[]>([])

    // Normalise the controlled value into an array of single chars.
    const chars = Array.from({ length }, (_, i) => value[i] ?? '')

    const pattern = mode === 'numeric' ? /[0-9]/ : /[a-zA-Z0-9]/

    const emit = (next: string) => {
        onChange?.(next)
        if (next.length === length && !next.includes(' ') && [...next].every(Boolean)) {
            onComplete?.(next)
        }
    }

    const setCharAt = (idx: number, char: string) => {
        const arr = chars.slice()
        arr[idx] = char
        emit(arr.join(''))
    }

    const focusBox = (idx: number) => {
        const el = refs.current[Math.max(0, Math.min(length - 1, idx))]
        el?.focus()
        el?.select()
    }

    const onBoxChange = (idx: number, raw: string) => {
        const char = raw.slice(-1)
        if (char && !pattern.test(char)) return
        setCharAt(idx, char)
        if (char) focusBox(idx + 1)
    }

    const onKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (chars[idx]) {
                setCharAt(idx, '')
            } else if (idx > 0) {
                setCharAt(idx - 1, '')
                focusBox(idx - 1)
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault(); focusBox(idx - 1)
        } else if (e.key === 'ArrowRight') {
            e.preventDefault(); focusBox(idx + 1)
        }
    }

    const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text').trim()
        const valid = [...text].filter((c) => pattern.test(c)).slice(0, length)
        if (valid.length === 0) return
        emit(valid.join(''))
        focusBox(valid.length)
    }

    return (
        <Field label={label} htmlFor={htmlFor} errorId={errorId} errorMessage={errorMessage} required={required} layout={layout} helperText={helperText}>
            <div className="flex items-center gap-2" role="group" aria-label={typeof label === 'string' ? label : 'One-time code'}>
                {chars.map((char, idx) => (
                    <React.Fragment key={idx}>
                        <input
                            ref={(el) => { refs.current[idx] = el }}
                            id={idx === 0 ? htmlFor : undefined}
                            name={idx === 0 ? name : undefined}
                            value={char}
                            disabled={disabled}
                            inputMode={mode === 'numeric' ? 'numeric' : 'text'}
                            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                            type={masked && char ? 'password' : 'text'}
                            maxLength={1}
                            aria-label={`Digit ${idx + 1}`}
                            aria-invalid={hasError || undefined}
                            aria-describedby={hasError ? errorId : undefined}
                            onChange={(e) => onBoxChange(idx, e.target.value)}
                            onKeyDown={(e) => onKeyDown(idx, e)}
                            onPaste={onPaste}
                            onFocus={(e) => e.target.select()}
                            className={[
                                BOX_SIZE[size],
                                'text-center font-medium rounded-lg border bg-surface text-foreground',
                                'transition-[border-color] duration-150',
                                hasError ? 'border-status-error' : 'border-border',
                                'hover:border-border-strong',
                                // Border-only focus, consistent with every field (no clip-prone ring).
                                'focus:outline-none focus:border-accent',
                                'disabled:bg-surface-raised disabled:text-foreground-muted disabled:cursor-not-allowed',
                            ].join(' ')}
                        />
                        {groupAfter && (idx + 1) % groupAfter === 0 && idx < length - 1 && (
                            <span className="w-2 text-center text-foreground-muted" aria-hidden="true">·</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </Field>
    )
}
