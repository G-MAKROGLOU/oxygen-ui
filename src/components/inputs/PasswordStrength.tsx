import React, { useMemo } from 'react'
import { cx } from '../../utils/cx'

export interface PasswordRule {
    label: React.ReactNode
    test: (password: string) => boolean
}

export type PasswordScore = 0 | 1 | 2 | 3 | 4

export interface PasswordStrengthResult {
    /** 0 = empty, 1 = weak … 4 = strong. */
    score: PasswordScore
    /** Human label for the score (`''` when empty). */
    label: string
}

/** The default requirement set — also drives the optional checklist. */
export const defaultPasswordRules: PasswordRule[] = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'A number', test: (p) => /\d/.test(p) },
    { label: 'A symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const

/**
 * Lightweight, dependency-free password scorer (0–4). Rewards length and
 * character variety; caps very repetitive or sequential strings at "weak".
 * Swap it out via the `scorer` prop (e.g. to plug in zxcvbn) if you need more.
 */
export function scorePassword(password: string): PasswordStrengthResult {
    if (!password) return { score: 0, label: '' }

    let s = 0
    if (password.length >= 8) s++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++
    if (/\d/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    if (password.length >= 12) s++

    // Penalise low-entropy strings (all one char, or simple sequences).
    const lowEntropy = /^(.)\1+$/.test(password) || /^(?:0123456789|abcdefghijklmnopqrstuvwxyz|qwertyuiop)/i.test(password)
    if (lowEntropy) s = Math.min(s, 1)

    const score = Math.max(1, Math.min(4, s)) as PasswordScore
    return { score, label: LABELS[score] }
}

const BAR_COLOR: Record<PasswordScore, string> = {
    0: 'bg-border',
    1: 'bg-status-error',
    2: 'bg-status-warning',
    3: 'bg-accent',
    4: 'bg-status-success',
}
const TEXT_COLOR: Record<PasswordScore, string> = {
    0: 'text-foreground-muted',
    1: 'text-status-error',
    2: 'text-status-warning',
    3: 'text-accent',
    4: 'text-status-success',
}

export interface PasswordStrengthProps {
    /** The password to evaluate. */
    value: string
    /** Override the built-in scorer (e.g. wrap zxcvbn). */
    scorer?: (password: string) => PasswordStrengthResult
    /** Show a checklist of which requirements are met. Default `false`. */
    showRequirements?: boolean
    /** Custom requirement list for the checklist. Default {@link defaultPasswordRules}. */
    rules?: PasswordRule[]
    /**
     * When provided, renders a "passwords match" indicator comparing `value` to
     * this confirmation value. Turns the strength component into the matcher too.
     */
    confirmValue?: string
    /** Hide the strength bar/label and show only the matcher + requirements. */
    hideMeter?: boolean
    className?: string
    style?: React.CSSProperties
}

const Tick = ({ ok }: { ok: boolean }) => (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cx('h-3.5 w-3.5 shrink-0', ok ? 'text-status-success' : 'text-foreground-muted')}>
        {ok ? (
            <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.7 6.3a1 1 0 0 0-1.4-1.4L9 10.18 7.7 8.88a1 1 0 0 0-1.4 1.42l2 2a1 1 0 0 0 1.4 0l4-4Z" />
        ) : (
            <circle cx="10" cy="10" r="2.5" fill="currentColor" />
        )}
    </svg>
)

/**
 * Password strength meter + (optional) requirement checklist + (optional)
 * confirm-password matcher. Controlled — feed it the current password `value`
 * (and `confirmValue` for the matcher). Scoring is a dependency-free heuristic;
 * override with `scorer`.
 *
 * @example
 * <Password value={pw} onChange={(e) => setPw(e.target.value)} />
 * <PasswordStrength value={pw} showRequirements confirmValue={confirm} />
 */
export default function PasswordStrength({
    value,
    scorer = scorePassword,
    showRequirements = false,
    rules = defaultPasswordRules,
    confirmValue,
    hideMeter = false,
    className = '',
    style,
}: PasswordStrengthProps) {
    const { score, label } = useMemo(() => scorer(value), [scorer, value])
    const showMatch = confirmValue != null && (value.length > 0 || confirmValue.length > 0)
    const matches = value.length > 0 && value === confirmValue

    return (
        <div className={cx('flex flex-col gap-2', className)} style={style} aria-live="polite">
            {!hideMeter && (
                <>
                    <div className="flex gap-1" role="meter" aria-valuemin={0} aria-valuemax={4} aria-valuenow={score} aria-label="Password strength">
                        {[1, 2, 3, 4].map((seg) => {
                            const active = seg <= score
                            return (
                                <div key={seg} className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                                    <div
                                        className={cx(
                                            'h-full origin-left rounded-full transition-[transform,background-color] duration-300 ease-out motion-reduce:transition-none',
                                            score > 0 ? BAR_COLOR[score] : 'bg-border',
                                        )}
                                        style={{ transform: `scaleX(${active ? 1 : 0})`, transitionDelay: active ? `${(seg - 1) * 70}ms` : '0ms' }}
                                    />
                                </div>
                            )
                        })}
                    </div>
                    {label && (
                        <p className="text-xs">
                            <span className="text-foreground-muted">Strength: </span>
                            <span className={cx('font-medium', TEXT_COLOR[score])}>{label}</span>
                        </p>
                    )}
                </>
            )}

            {showRequirements && (
                <ul className="mt-0.5 flex flex-col gap-1">
                    {rules.map((rule, i) => {
                        const ok = rule.test(value)
                        return (
                            <li key={i} className={cx('flex items-center gap-1.5 text-xs', ok ? 'text-foreground-secondary' : 'text-foreground-muted')}>
                                <Tick ok={ok} />
                                {rule.label}
                            </li>
                        )
                    })}
                </ul>
            )}

            {showMatch && (
                <p className={cx('flex items-center gap-1.5 text-xs font-medium', matches ? 'text-status-success' : 'text-status-error')}>
                    <Tick ok={matches} />
                    {matches ? 'Passwords match' : 'Passwords don’t match'}
                </p>
            )}
        </div>
    )
}
