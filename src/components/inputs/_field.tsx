import React from 'react'
import Tooltip from '../core/Tooltip'
import { cx } from '../../utils/cx'

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

// CONSISTENCY: every input shows the IDENTICAL focus treatment under the same
// conditions — the border turns accent. We deliberately use NO ring/box-shadow
// halo: a ring is a box-shadow that any ancestor with `overflow` (incl. the
// Storybook canvas) clips, producing the choppy "rounded-top, square-bottom"
// artifact. A border-colour change can never be clipped and reads cleanly.
// `:focus` (not `:focus-visible`) so it shows on mouse + keyboard, matching
// text inputs (focus-within). `data-[state=open]` keeps it lit while a popover
// trigger's panel is open even after Radix moves focus into the panel.
const FOCUS_WITHIN =
    'focus-within:outline-none focus-within:border-accent'
const FOCUS_ELEMENT =
    'focus:outline-none focus:border-accent data-[state=open]:border-accent'
const FOCUS_WITHIN_ERROR =
    'focus-within:border-status-error'
const FOCUS_ELEMENT_ERROR =
    'focus:border-status-error data-[state=open]:border-status-error'

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
    return cx(
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
    )
}

// ── Help icon + shared label ──────────────────────────────────────────────────

/**
 * Small themed "info" affordance shown beside a field label. Hovering or
 * focusing it reveals `helperText` in a tooltip. Rendered as a `type="button"`
 * so it never submits an enclosing form, and coloured from semantic tokens so
 * it follows the active theme.
 */
export function FieldHelpIcon({ text }: { text: React.ReactNode }) {
    return (
        <Tooltip title={text} placement="top">
            <button
                type="button"
                aria-label="More information"
                className="inline-flex items-center justify-center rounded-full text-foreground-muted transition-colors hover:text-foreground focus:outline-none focus-visible:text-accent"
            >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <circle cx="8" cy="8" r="6.25" />
                    <path strokeLinecap="round" d="M8 7.4v3.4" />
                    <circle cx="8" cy="5.1" r="0.65" fill="currentColor" stroke="none" />
                </svg>
            </button>
        </Tooltip>
    )
}

export interface FieldLabelProps {
    label?: React.ReactNode
    htmlFor?: string
    required?: boolean
    /** Reveals an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /** Apply horizontal-layout spacing (no-wrap, shrink). */
    horizontal?: boolean
    /**
     * Vertical alignment of the label against the control in horizontal layout.
     * `'start'` (default) nudges the label down to meet a standard ~36px input's
     * first line; `'center'` removes that offset so the label centres against a
     * short control (Switch, SegmentedControl).
     */
    align?: 'start' | 'center'
    style?: React.CSSProperties
    /** Label column width in horizontal layout. */
    width?: string | number
    className?: string
}

/**
 * The label row shared by every input — label text + required asterisk +
 * optional `helperText` info icon. Components that render their own label
 * outside `<Field>` (Dropdown, DatePicker, Switch, SegmentedControl) use this
 * so the affordance is pixel-identical everywhere.
 *
 * Returns `null` when there's nothing to show (no label and no helperText).
 */
export function FieldLabel({
    label,
    htmlFor,
    required,
    helperText,
    horizontal = false,
    align = 'start',
    style,
    width,
    className = '',
}: FieldLabelProps) {
    if (label == null && helperText == null) return null
    return (
        <div
            style={{ width: horizontal ? width : undefined, ...style }}
            className={cx(
                'flex items-center gap-1',
                horizontal ? 'flex-shrink-0 whitespace-nowrap' : '',
                // Only the 'start' alignment needs the top nudge; 'center' relies
                // on the row's items-center to line up with a short control.
                horizontal && align === 'start' ? 'mt-2' : '',
                className,
            )}
        >
            {label != null && (
                <label htmlFor={htmlFor} className="text-sm font-medium text-foreground select-none">
                    {label}
                    {required && <span className="text-status-error ml-0.5" aria-hidden="true">*</span>}
                </label>
            )}
            {helperText != null && <FieldHelpIcon text={helperText} />}
        </div>
    )
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
    /** Contextual help revealed via an info icon + tooltip beside the label. */
    helperText?: React.ReactNode
    /**
     * Label alignment against the control in horizontal layout. `'start'`
     * (default) for standard-height inputs; `'center'` for short controls
     * (Switch) so the label lines up with the control's centre.
     */
    labelAlign?: 'start' | 'center'
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
    helperText,
    labelAlign = 'start',
    labelStyle,
    labelWidth,
    className = '',
    children,
}: FieldProps) {
    const hasError = errorMessage != null
    const horizontal = layout === 'horizontal'
    return (
        <div
            className={cx(
                'flex',
                horizontal
                    ? `flex-row gap-3 ${labelAlign === 'center' ? 'items-center' : 'items-start'}`
                    : 'flex-col gap-1.5',
                className,
            )}
        >
            <FieldLabel
                label={label}
                htmlFor={htmlFor}
                required={required}
                helperText={helperText}
                horizontal={horizontal}
                align={labelAlign}
                style={labelStyle}
                width={labelWidth}
            />
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
