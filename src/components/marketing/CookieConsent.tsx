import React from 'react'
import Portal from '../layout/Portal'
import Button from '../inputs/Button'
import { useLocalStorage } from '../../hooks/useLocalStorage'

export type ConsentChoice = 'accepted' | 'declined'

export interface CookieConsentProps {
    /** Banner body. */
    message?: React.ReactNode
    /** Optional bold heading above the message. */
    title?: React.ReactNode
    acceptLabel?: string
    /** Show a decline action with this label (omit for accept-only). */
    declineLabel?: string
    onAccept?: () => void
    onDecline?: () => void
    /** Link to your cookie / privacy policy. */
    learnMoreHref?: string
    learnMoreLabel?: string
    /**
     * localStorage key that remembers the choice so the banner stays dismissed.
     * Default `'oxygen-cookie-consent'`. Pass `null` to disable persistence and
     * control visibility yourself via `open`.
     */
    storageKey?: string | null
    /** Controlled visibility. Overrides the persisted state when provided. */
    open?: boolean
    /** On-screen placement. Default `'bottom'`. */
    position?: 'bottom' | 'bottom-left' | 'bottom-right'
    className?: string
}

const POS: Record<NonNullable<CookieConsentProps['position']>, string> = {
    'bottom': 'inset-x-0 bottom-0 sm:inset-x-4 sm:bottom-4',
    'bottom-left': 'inset-x-0 bottom-0 sm:inset-x-auto sm:left-4 sm:bottom-4 sm:max-w-md',
    'bottom-right': 'inset-x-0 bottom-0 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md',
}

/**
 * A cookie / consent banner. Self-managing by default: it remembers the visitor's
 * choice in `localStorage` (`storageKey`) and stays dismissed on return. Pass
 * `storageKey={null}` + `open` to control it yourself. Fires `onAccept` /
 * `onDecline` so you can (de)activate analytics.
 *
 * @example
 * <CookieConsent
 *   message="We use cookies to improve your experience."
 *   declineLabel="Reject"
 *   learnMoreHref="/privacy"
 *   onAccept={enableAnalytics}
 * />
 */
export default function CookieConsent({
    message = 'We use cookies to enhance your experience, analyse traffic, and personalise content.',
    title,
    acceptLabel = 'Accept all',
    declineLabel,
    onAccept,
    onDecline,
    learnMoreHref,
    learnMoreLabel = 'Learn more',
    storageKey = 'oxygen-cookie-consent',
    open,
    position = 'bottom',
    className = '',
}: CookieConsentProps) {
    const persist = typeof storageKey === 'string'
    const [stored, setStored] = useLocalStorage<ConsentChoice | null>(persist ? storageKey : '__oxygen_cc_off__', null)

    const visible = open ?? (persist ? stored == null : true)

    const choose = (choice: ConsentChoice, cb?: () => void) => {
        if (persist) setStored(choice)
        cb?.()
    }

    if (!visible) return null

    return (
        <Portal>
            <div
                role="dialog"
                aria-label="Cookie consent"
                aria-live="polite"
                className={['fixed z-[60]', POS[position], className].filter(Boolean).join(' ')}
            >
                <div className="flex flex-col gap-4 border-t border-border bg-surface p-5 shadow-lg sm:flex-row sm:items-center sm:rounded-xl sm:border">
                    <div className="flex-1 text-sm leading-relaxed text-foreground-secondary">
                        {title != null && <p className="mb-1 font-semibold text-foreground">{title}</p>}
                        <span>{message}</span>
                        {learnMoreHref && (
                            <>
                                {' '}
                                <a href={learnMoreHref} className="font-medium text-accent underline-offset-2 hover:underline">{learnMoreLabel}</a>
                            </>
                        )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                        {declineLabel && (
                            <Button variant="outline" content={declineLabel} onClick={() => choose('declined', onDecline)} />
                        )}
                        <Button content={acceptLabel} onClick={() => choose('accepted', onAccept)} />
                    </div>
                </div>
            </div>
        </Portal>
    )
}
