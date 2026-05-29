import React from 'react'

/**
 * Shared field foundation for all oxygen-ui inputs.
 *
 * Centralises the things every input must agree on:
 * - the **size scale** (sm / md / lg) → control height + text size + padding
 * - the **refined focus treatment** — a crisp 1px accent border plus a soft
 *   3px low-opacity halo (NOT a heavy solid ring band)
 * - the **resting / hover / error / disabled** border + background states
 * - a **`<Field>` wrapper** handling label, error region, layout
 *   (horizontal / vertical) and `aria` linkage consistently
 *
 * All values map to design-system tokens (control heights, semantic colours,
 * radii) so a consumer's ThemeProvider override flows straight through.
 */

export type FieldSize = 'sm' | 'md' | 'lg'

interface SizeSpec {
    /** Control height utility (token-backed). */
    control: string
    /** Text size for the value. */
    text: string
    /** Horizontal padding. */
    padX: string
    /** Gap between adornments inside the control. */
    gap: string
}

export const FIELD_SIZE: Record<FieldSize, SizeSpec> = {
    sm: { control: 'h-control-sm', text: 'text-xs', padX: 'px-2.5', gap: 'gap-1.5' },
    md: { control: 'h-control-md', text: 'text-sm', padX: 'px-3',   gap: 'gap-2'   },
    lg: { control: 'h-control-lg', text: 'text-sm', padX: 'px-3.5', gap: 'gap-2.5' },
}

// ── Focus + state literals ───────────────────────────────────────────────────
// These MUST be written as full literal strings so Tailwind's JIT scanner
// emits the CSS. Do not template the variant prefix.

// CONSISTENCY: every input shows the IDENTICAL halo under the same conditions.
// We use `:focus` (not `:focus-visible`) so the halo appears on BOTH mouse
// click and keyboard focus — text inputs already do this via `focus-within`,
// and popover triggers (Dropdown / DatePicker / TreeSelect / TimePicker /
// ColorPicker / DateRangePicker) now match. `data-[state=open]` keeps the
// halo lit while a popover is open even after Radix moves focus into it.
const FOCUS_WITHIN =
    'focus-within:outline-none focus-within:border-accent focus-within:ring-[3px] focus-within:ring-focus-ring'
const FOCUS_ELEMENT =
    'focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-focus-ring data-[state=open]:border-accent data-[state=open]:ring-[3px] data-[state=open]:ring-focus-ring'
const FOCUS_WITHIN_ERROR =
    'focus-within:border-status-error focus-within:ring-focus-ring-error'
const FOCUS_ELEMENT_ERROR =
    'focus:border-status-error focus:ring-focus-ring-error data-[state=open]:border-status-error data-[state=open]:ring-focus-ring-error'

export interface FieldShellOptions {
    size?: FieldSize
    hasError?: boolean
    disabled?: boolean
    /**
     * `true` for wrapper elements that hold a real `<input>` inside
     * (focus-within), `false` for elements that are themselves focusable
     * like `<button>` triggers (focus-visible). Default `false`.
     */
    focusWithin?: boolean
    /** Append height/padding utilities (for single-line inputs). Default `true`. */
    sized?: boolean
}

/**
 * Compose the className for an input's outer "shell" — the bordered, rounded
 * box that carries the focus ring. Apply to the `<input>` directly, or to a
 * wrapper `<div>` that contains an input plus adornments (pass
 * `focusWithin: true` in that case).
 */
export function fieldShell({
    size = 'md',
    hasError = false,
    disabled = false,
    focusWithin = false,
    sized = true,
}: FieldShellOptions = {}): string {
    const s = FIELD_SIZE[size]
    return [
        'w-full rounded-lg border bg-surface text-foreground',
        'transition-[color,box-shadow,border-color] duration-150',
        s.text,
        sized ? `${s.control} ${s.padX}` : '',
        // resting border
        hasError ? 'border-status-error' : 'border-border',
        // hover (only when interactive + no error)
        disabled
            ? 'bg-surface-raised text-foreground-muted cursor-not-allowed'
            : hasError ? '' : 'hover:border-border-strong',
        // focus
        focusWithin ? FOCUS_WITHIN : FOCUS_ELEMENT,
        hasError ? (focusWithin ? FOCUS_WITHIN_ERROR : FOCUS_ELEMENT_ERROR) : '',
        // placeholder colour for native inputs
        'placeholder:text-foreground-muted',
    ].filter(Boolean).join(' ')
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

export interface FieldProps {
    label?: React.ReactNode
    /** `id` of the control — links the `<label htmlFor>`. */
    htmlFor?: string
    /** `id` for the error region — pair with `aria-describedby` on the control. */
    errorId?: string
    errorMessage?: React.ReactNode
    /** Orientation of label vs control. Default `'vertical'`. */
    layout?: 'horizontal' | 'vertical'
    /** Show a required asterisk after the label. */
    required?: boolean
    labelStyle?: React.CSSProperties
    /** Width of the label column in horizontal layout (CSS length). */
    labelWidth?: string | number
    className?: string
    /** The control itself (input / trigger / dropzone). */
    children: React.ReactNode
}

/**
 * Layout wrapper shared by every input. Renders:
 *
 * ```
 * vertical:                  horizontal:
 *   [label]                    [label] [ control        ]
 *   [ control ]                        [ error message  ]
 *   [ error   ]
 * ```
 *
 * The error message always sits under the **control only** (never spanning
 * the label in horizontal layout). Label uses full-contrast foreground +
 * medium weight so it reads as the anchor, while the input's placeholder is
 * muted — establishing hierarchy without making the label tiny.
 */
export function Field({
    label,
    htmlFor,
    errorId,
    errorMessage,
    layout = 'vertical',
    required,
    labelStyle,
    labelWidth,
    className = '',
    children,
}: FieldProps) {
    const hasError = errorMessage != null
    const horizontal = layout === 'horizontal'
    return (
        <div
            className={[
                'flex',
                horizontal ? 'flex-row items-start gap-3' : 'flex-col gap-1.5',
                className,
            ].filter(Boolean).join(' ')}
        >
            {label && (
                <label
                    htmlFor={htmlFor}
                    style={{ width: horizontal ? labelWidth : undefined, ...labelStyle }}
                    className={[
                        'text-sm font-medium text-foreground select-none',
                        // In horizontal layout the label must not wrap onto
                        // multiple lines (e.g. "Report date", "Select option").
                        horizontal ? 'mt-2 flex-shrink-0 whitespace-nowrap' : '',
                    ].filter(Boolean).join(' ')}
                >
                    {label}
                    {required && <span className="text-status-error ml-0.5" aria-hidden="true">*</span>}
                </label>
            )}
            <div className="flex flex-col min-w-0 flex-1">
                {children}
                {hasError && (
                    <div id={errorId} className="text-status-error text-xs mt-1">
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    )
}
