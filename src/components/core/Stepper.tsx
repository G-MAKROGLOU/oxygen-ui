import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cx } from '../../utils/cx'

export type StepperActiveStatus = 'active' | 'loading' | 'error'
type StepState = 'pending' | 'active' | 'completed' | 'error' | 'loading'

export interface StepperStep {
    key: string | number
    title: React.ReactNode
    description?: React.ReactNode
    /** Custom indicator content (overrides the default number / check). */
    icon?: React.ReactNode
}

export interface StepperProps {
    steps: StepperStep[]
    /** Index of the active step (0-based). Steps before it render completed. */
    current: number
    /**
     * Status of the *active* step. `'loading'` shows a spinner (for async
     * steps); `'error'` marks it failed. Default `'active'`.
     */
    status?: StepperActiveStatus
    /** Layout. Default `'horizontal'`. */
    orientation?: 'horizontal' | 'vertical'
    /** Switch horizontal → vertical below the `md` breakpoint. Default `true`. */
    responsive?: boolean
    /** Make completed / visited steps clickable. */
    onStepClick?: (index: number) => void
    size?: 'sm' | 'md'
    className?: string
}

const SIZES = {
    sm: { box: 'h-7 w-7 text-xs', center: 14, title: 'text-xs', desc: 'text-[11px]' },
    md: { box: 'h-9 w-9 text-sm', center: 18, title: 'text-sm', desc: 'text-xs' },
} as const

const Check = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true" className="h-1/2 w-1/2 animate-check-pop">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
    </svg>
)
const Cross = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true" className="h-1/2 w-1/2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
    </svg>
)
const Spinner = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-1/2 w-1/2 animate-spin">
        <path fillRule="evenodd" clipRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" />
    </svg>
)

function Indicator({ state, index, step, sizeKey }: { state: StepState; index: number; step: StepperStep; sizeKey: 'sm' | 'md' }) {
    const reduced = useReducedMotion()
    const s = SIZES[sizeKey]
    const base = `relative z-10 flex flex-shrink-0 items-center justify-center rounded-full font-semibold transition-colors ${s.box}`
    const tone: Record<StepState, string> = {
        completed: 'bg-accent text-accent-fg',
        active: 'border-2 border-accent bg-surface text-accent',
        loading: 'border-2 border-accent bg-surface text-accent',
        error: 'bg-status-error text-white',
        pending: 'border border-border bg-surface text-foreground-muted',
    }
    const content = step.icon ?? (
        state === 'completed' ? <Check /> :
        state === 'error' ? <Cross /> :
        state === 'loading' ? <Spinner /> :
        index + 1
    )
    return (
        <motion.span
            className={`${base} ${tone[state]}`}
            initial={false}
            animate={reduced ? undefined : { scale: state === 'active' || state === 'loading' ? 1.06 : 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            aria-current={state === 'active' || state === 'loading' ? 'step' : undefined}
        >
            {content}
        </motion.span>
    )
}

function VConnector({ filled, reduced }: { filled: boolean; reduced: boolean | null }) {
    return (
        <span className="relative my-1 w-0.5 flex-1 bg-border">
            <motion.span
                className="absolute inset-0 bg-accent"
                style={{ originY: 0 }}
                initial={false}
                animate={{ scaleY: filled ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
        </span>
    )
}

/**
 * A configurable steps indicator for multi-step flows — wizards, onboarding,
 * async pipelines. Completed steps show a check, the active step is highlighted
 * (or a spinner via `status="loading"` for async work, or an error mark), and
 * the connectors fill up to the current step. Horizontal or vertical, with an
 * optional responsive collapse to vertical on small screens.
 *
 * Controlled: you own `current` (and `status` for the active step).
 *
 * @example
 * <Stepper current={step} status={saving ? 'loading' : 'active'} steps={[
 *   { key: 'cart', title: 'Cart', description: '3 items' },
 *   { key: 'pay',  title: 'Payment' },
 *   { key: 'done', title: 'Done' },
 * ]} />
 */
export default function Stepper({
    steps,
    current,
    status = 'active',
    orientation = 'horizontal',
    responsive = true,
    onStepClick,
    size = 'md',
    className = '',
}: StepperProps) {
    const reduced = useReducedMotion()
    const [forcedVertical, setForcedVertical] = useState(false)

    useEffect(() => {
        if (!responsive || orientation === 'vertical') return
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
        const mq = window.matchMedia('(max-width: 767px)')
        const apply = (e: MediaQueryList | MediaQueryListEvent) => setForcedVertical(e.matches)
        apply(mq)
        const handler = (e: MediaQueryListEvent) => apply(e)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [responsive, orientation])

    const vertical = orientation === 'vertical' || forcedVertical
    const s = SIZES[size]

    const stateOf = (i: number): StepState =>
        i < current ? 'completed' : i === current ? status : 'pending'

    const Label = ({ step, state, align }: { step: StepperStep; state: StepState; align: 'center' | 'left' }) => (
        <div className={align === 'center' ? 'mt-2 text-center' : 'pt-0.5'}>
            <div className={`font-medium leading-tight ${s.title} ${state === 'pending' ? 'text-foreground-muted' : 'text-foreground'}`}>
                {step.title}
            </div>
            {step.description && <div className={`mt-0.5 leading-snug text-foreground-muted ${s.desc}`}>{step.description}</div>}
        </div>
    )

    const clickable = (i: number) => Boolean(onStepClick) && i <= current
    const stepButton = (i: number, node: React.ReactNode) =>
        clickable(i) ? (
            <button type="button" onClick={() => onStepClick?.(i)} className="rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                {node}
            </button>
        ) : node

    if (vertical) {
        return (
            <ol className={cx('flex flex-col', className)}>
                {steps.map((step, i) => {
                    const state = stateOf(i)
                    const last = i === steps.length - 1
                    return (
                        <li key={step.key} className="flex gap-3">
                            <div className="flex flex-col items-center self-stretch">
                                {stepButton(i, <Indicator state={state} index={i} step={step} sizeKey={size} />)}
                                {!last && <VConnector filled={i < current} reduced={reduced} />}
                            </div>
                            <div className={last ? '' : 'pb-6'}>{stepButton(i, <Label step={step} state={state} align="left" />)}</div>
                        </li>
                    )
                })}
            </ol>
        )
    }

    return (
        <ol className={cx('flex items-start', className)}>
            {steps.map((step, i) => {
                const state = stateOf(i)
                return (
                    <li key={step.key} className="relative flex flex-1 flex-col items-center">
                        {i > 0 && (
                            <span className="absolute right-1/2 h-0.5 w-full bg-border" style={{ top: s.center - 1 }}>
                                <motion.span
                                    className="absolute inset-0 bg-accent"
                                    style={{ originX: 0 }}
                                    initial={false}
                                    animate={{ scaleX: i <= current ? 1 : 0 }}
                                    transition={reduced ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                />
                            </span>
                        )}
                        {stepButton(i, (
                            <div className="flex flex-col items-center">
                                <Indicator state={state} index={i} step={step} sizeKey={size} />
                                <Label step={step} state={state} align="center" />
                            </div>
                        ))}
                    </li>
                )
            })}
        </ol>
    )
}
