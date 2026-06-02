import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as Popover from '@radix-ui/react-popover'
import Button, { ButtonProps } from '../inputs/Button'

export type PopConfirmTone = 'default' | 'info' | 'warning' | 'error' | 'danger' | 'success'

export interface PopConfirmProps {
    /** The trigger element. Cloned as the popover anchor (rendered `asChild`). */
    children: React.ReactElement
    /** The confirmation question / heading. */
    title: React.ReactNode
    /** Optional secondary line under the title. */
    description?: React.ReactNode
    /** Runs on confirm. If it returns a promise, the confirm button shows a loading state until it settles. */
    onConfirm?: () => void | Promise<void>
    /** Runs on cancel / dismiss. */
    onCancel?: () => void
    /** Confirm button label. Default `'Confirm'`. */
    confirmText?: React.ReactNode
    /** Cancel button label. Default `'Cancel'`. */
    cancelText?: React.ReactNode
    /** Visual + semantic tone of the confirmation prompt. Default `'default'`. */
    tone?: PopConfirmTone
    /** Leading icon shown beside the title. */
    icon?: React.ReactNode
    /** Side of the trigger to open on. Default `'top'`. */
    side?: 'top' | 'right' | 'bottom' | 'left'
    /** Controlled open state (optional). */
    open?: boolean
    onOpenChange?: (open: boolean) => void
    className?: string
}

const ICON_COLOR: Record<PopConfirmTone, string> = {
    default: 'text-foreground-muted',
    info:    'text-status-info',
    warning: 'text-status-warning',
    error:   'text-status-error',
    danger:  'text-status-error',
    success: 'text-status-success',
}

const CONFIRM_VARIANT: Record<PopConfirmTone, ButtonProps['variant']> = {
    default: 'primary',
    info:    'info',
    warning: 'warning',
    error:   'danger',
    danger:  'danger',
    success: 'success',
}

/**
 * A lightweight confirm prompt anchored to its trigger, on Radix Popover. Use it
 * for in-place "are you sure?" gates (delete, archive, publish, etc.) instead of
 * a full Modal. An async `onConfirm` keeps the confirm button in a loading state
 * until it resolves, then closes.
 *
 * @example
 * ```tsx
 * <PopConfirm title="Delete this vessel?" tone="error" confirmText="Delete" onConfirm={remove}>
 *   <Button content="Delete" variant="danger" />
 * </PopConfirm>
 * ```
 */
export default function PopConfirm({
    children,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    tone = 'default',
    icon,
    side = 'top',
    open,
    onOpenChange,
    className = '',
}: PopConfirmProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const isOpen = open ?? uncontrolledOpen

    const setOpen = (next: boolean) => {
        onOpenChange?.(next)
        if (open === undefined) setUncontrolledOpen(next)
    }

    const handleConfirm = async () => {
        try {
            setLoading(true)
            await onConfirm?.()
            setOpen(false)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        onCancel?.()
        setOpen(false)
    }

    return (
        <Popover.Root open={isOpen} onOpenChange={(o) => (o ? setOpen(true) : handleCancel())}>
            <Popover.Trigger asChild>{children}</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    side={side}
                    sideOffset={8}
                    collisionPadding={12}
                    className={['z-[400] focus:outline-none', className].filter(Boolean).join(' ')}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                        className="w-64 rounded-lg border border-border bg-surface p-3.5 shadow-lg"
                    >
                        <div className="flex gap-2.5">
                            {icon && (
                                <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center ${ICON_COLOR[tone]}`}>
                                    {icon}
                                </span>
                            )}
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground">{title}</div>
                                {description && (
                                    <div className="mt-1 text-xs text-foreground-secondary leading-snug">
                                        {description}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                            <Button content={cancelText} size="sm" variant="ghost" onClick={handleCancel} />
                            <Button
                                content={confirmText}
                                size="sm"
                                variant={CONFIRM_VARIANT[tone]}
                                loading={loading}
                                onClick={handleConfirm}
                            />
                        </div>
                    </motion.div>
                    <Popover.Arrow className="fill-surface" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}
