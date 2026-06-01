import React, { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import Button from '../inputs/Button'

export type PopConfirmTone = 'default' | 'danger'

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
    /** `'danger'` colours the confirm button red. Default `'default'`. */
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

/**
 * A lightweight confirm prompt anchored to its trigger, on Radix Popover. Use it
 * for in-place "are you sure?" gates (delete, archive) instead of a full Modal.
 * An async `onConfirm` keeps the confirm button in a loading state until it
 * resolves, then closes.
 *
 * @example
 * ```tsx
 * <PopConfirm title="Delete this vessel?" tone="danger" confirmText="Delete" onConfirm={remove}>
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
                    className={[
                        'z-[400] w-64 rounded-lg border border-border bg-surface p-3.5 shadow-lg',
                        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                        className,
                    ].filter(Boolean).join(' ')}
                >
                    <div className="flex gap-2.5">
                        {icon && (
                            <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center ${tone === 'danger' ? 'text-status-error' : 'text-status-warning'}`}>
                                {icon}
                            </span>
                        )}
                        <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground">{title}</div>
                            {description && <div className="mt-1 text-xs text-foreground-secondary leading-snug">{description}</div>}
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                        <Button content={cancelText} size="sm" variant="ghost" onClick={handleCancel} />
                        <Button
                            content={confirmText}
                            size="sm"
                            variant={tone === 'danger' ? 'danger' : 'primary'}
                            loading={loading}
                            onClick={handleConfirm}
                        />
                    </div>
                    <Popover.Arrow className="fill-surface" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}
