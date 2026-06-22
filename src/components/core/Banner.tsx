import React from 'react'
import { Info, CheckCircle, Warning, Error as ErrorIcon, X } from '../../icons/icons'
import { cx } from '../../utils/cx'

export type BannerTone = 'info' | 'success' | 'warning' | 'danger'

export interface BannerProps {
    /** Semantic tone — drives the tint, icon colour, and default icon. */
    tone: BannerTone
    /** Banner body. */
    children: React.ReactNode
    /** Leading icon. Defaults to a tone-appropriate icon when omitted. */
    icon?: React.ReactNode
    /** When provided, renders a trailing dismiss (×) button that calls this. */
    onDismiss?: () => void
    /** Extra classes merged onto the root. */
    className?: string
}

// Low-opacity tint per tone, with the solid tone colour reserved for the icon.
// `color-mix` is used rather than a `/opacity` modifier because the status
// tokens are `var()`-valued — Tailwind's slash-opacity emits transparent CSS
// for those, whereas color-mix tints correctly in both light and dark.
const TONE_BG: Record<BannerTone, string> = {
    info:    'bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)]',
    success: 'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]',
    warning: 'bg-[color-mix(in_srgb,var(--color-warning)_15%,transparent)]',
    danger:  'bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)]',
}

const TONE_FG: Record<BannerTone, string> = {
    info:    'text-status-info',
    success: 'text-status-success',
    warning: 'text-status-warning',
    danger:  'text-status-error',
}

const DEFAULT_ICON: Record<BannerTone, React.ReactNode> = {
    info:    <Info size={18} />,
    success: <CheckCircle size={18} />,
    warning: <Warning size={18} />,
    danger:  <ErrorIcon size={18} />,
}

/**
 * Full-width inline message banner with a semantic tone. A flat, tinted
 * container (no shadow) with a tone-coloured leading icon, body content, and an
 * optional dismiss button. For transient toasts use `useNotification`; for
 * blocking confirmation use `Modal` / `PopConfirm`.
 *
 * @example
 * ```tsx
 * <Banner tone="info" className="mb-2">
 *   Toggle a switch on to activate a custom filter.
 * </Banner>
 *
 * <Banner tone="danger" onDismiss={() => setShown(false)}>
 *   Sync failed — changes were not saved.
 * </Banner>
 * ```
 */
export default function Banner({ tone, children, icon, onDismiss, className = '' }: BannerProps) {
    return (
        <div
            // Warning/danger are assertive; info/success are polite.
            role={tone === 'warning' || tone === 'danger' ? 'alert' : 'status'}
            className={cx('flex w-full items-start gap-2.5 rounded-md p-3 text-sm text-foreground', TONE_BG[tone], className)}
        >
            <span className={cx('mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center', TONE_FG[tone])}>
                {icon ?? DEFAULT_ICON[tone]}
            </span>

            <div className="min-w-0 flex-1">{children}</div>

            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss"
                    className="-mr-1 -mt-1 flex h-6 w-6 flex-shrink-0 self-start items-center justify-center rounded-md text-foreground-muted transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    )
}
