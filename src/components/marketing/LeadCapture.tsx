import React, { useState } from 'react'
import Button from '../inputs/Button'
import { fieldShell } from '../inputs/_field'
import { cx } from '../../utils/cx'

export interface LeadCaptureProps {
    title: React.ReactNode
    description?: React.ReactNode
    /** Email field placeholder. Default `'you@company.com'`. */
    placeholder?: string
    /** Accessible label for the email field. Default `'Email address'`. */
    inputLabel?: string
    buttonLabel?: React.ReactNode
    /** Fired with the entered email on submit. */
    onSubmit?: (email: string) => void
    /** Small print under the form (e.g. a privacy note). */
    note?: React.ReactNode
    /** Confirmation shown after a successful submit (replaces the form). */
    successMessage?: React.ReactNode
    /** Backdrop treatment. Default `'gradient'`. */
    background?: 'surface' | 'gradient'
    centered?: boolean
    className?: string
    style?: React.CSSProperties
}

const GRADIENT = 'radial-gradient(120% 140% at 50% 0%, color-mix(in oklab, var(--color-accent) 14%, transparent), transparent 70%)'

/**
 * A footer call-to-action band with an inline email-capture form, title,
 * supporting copy, an email field, and a submit button. Shows a confirmation in
 * place of the form once submitted.
 *
 * @example
 * <LeadCapture
 *   title="Stay in the loop"
 *   description="Product updates and maritime insights, monthly."
 *   buttonLabel="Subscribe"
 *   onSubmit={(email) => subscribe(email)}
 * />
 */
export default function LeadCapture({
    title,
    description,
    placeholder = 'you@company.com',
    inputLabel = 'Email address',
    buttonLabel = 'Subscribe',
    onSubmit,
    note,
    successMessage = 'Thanks, you’re on the list.',
    background = 'gradient',
    centered = true,
    className = '',
    style,
}: LeadCaptureProps) {
    const [email, setEmail] = useState('')
    const [done, setDone] = useState(false)

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const value = email.trim()
        if (!value) return
        onSubmit?.(value)
        setDone(true)
    }

    const isGradient = background === 'gradient'

    return (
        <section
            className={cx('w-full overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 sm:px-12 sm:py-16', className)}
            style={{ ...(isGradient ? { backgroundImage: GRADIENT } : {}), ...style }}
        >
            <div className={['mx-auto flex max-w-2xl flex-col gap-4', centered ? 'items-center text-center' : 'items-start text-left'].join(' ')}>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
                {description != null && <p className="max-w-xl text-base leading-relaxed text-foreground-secondary">{description}</p>}

                {done ? (
                    <p role="status" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-status-success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {successMessage}
                    </p>
                ) : (
                    <form onSubmit={submit} className={['mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row', centered ? 'sm:justify-center' : ''].join(' ')}>
                        <label htmlFor="oxygen-lead-email" className="sr-only">{inputLabel}</label>
                        <input
                            id="oxygen-lead-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={placeholder}
                            autoComplete="email"
                            className={[fieldShell({ size: 'md' }), 'flex-1'].join(' ')}
                        />
                        <Button content={buttonLabel} className="shrink-0" />
                    </form>
                )}

                {note != null && !done && <p className="text-xs text-foreground-muted">{note}</p>}
            </div>
        </section>
    )
}
