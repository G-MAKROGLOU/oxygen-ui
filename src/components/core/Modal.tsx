import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Button from '../inputs/Button'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/** Named max-width scale (px) — keeps modal widths consistent across the app. */
const SIZE_MAP: Record<ModalSize, number | string> = {
    sm:   400,
    md:   600,
    lg:   800,
    xl:   1000,
    full: 'calc(100vw - 2rem)',
}

export interface ModalProps {
    /**
     * Named width scale (default `'md'`). Keeps modals consistent across the
     * app: sm 400 · md 600 · lg 800 · xl 1000 · full (viewport − 2rem).
     */
    size?: ModalSize
    /**
     * Explicit max-width escape hatch — a number (px) or any CSS length
     * (e.g. `'48rem'`). Overrides `size` when set.
     *
     * Height is always content-driven (max 90 dvh): modals grow with their
     * content and scroll internally rather than taking a fixed height.
     */
    width?: number | string
    open?: boolean
    onClose?: () => void
    onOk?: () => void
    onCancel?: () => void
    okText?: string
    cancelText?: string
    hasFooter?: boolean
    title?: React.ReactNode
    children?: React.ReactNode
    /** Extra classes merged onto the modal panel. */
    className?: string
}

/**
 * Centred modal dialog powered by Radix Dialog + Framer Motion.
 *
 * Radix handles focus-trap, escape-to-close, and ARIA roles.
 * Framer Motion drives the scale + fade enter/exit animation.
 * prefers-reduced-motion is respected via useReducedMotion().
 *
 * @example
 * <Modal open={open} onClose={() => setOpen(false)} title="Confirm" onOk={handleOk}>
 *   Are you sure you want to delete this item?
 * </Modal>
 */
export default function Modal({
    width,
    size = 'md',
    open = false,
    onClose,
    onOk,
    onCancel,
    okText = 'Ok',
    cancelText = 'Cancel',
    hasFooter = true,
    title,
    children,
    className = '',
}: ModalProps) {
    const reduced = useReducedMotion()
    // Explicit `width` wins; otherwise resolve the named size scale.
    const maxWidth = width ?? SIZE_MAP[size]

    return (
        <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose?.() }}>
            <Dialog.Portal forceMount>
                {/* ── Backdrop ── */}
                <AnimatePresence>
                    {open && (
                        <Dialog.Overlay asChild>
                            <motion.div
                                className="fixed inset-0 bg-backdrop z-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
                            />
                        </Dialog.Overlay>
                    )}
                </AnimatePresence>

                {/* ── Panel ── */}
                <AnimatePresence>
                    {open && (
                        <Dialog.Content asChild>
                            <motion.div
                                className={`fixed left-1/2 top-1/2 z-modal flex flex-col w-[calc(100%-2rem)] max-h-[90dvh] bg-surface rounded-2xl shadow-xl overflow-hidden focus:outline-none ${className}`.trim()}
                                style={{
                                    maxWidth,
                                    x: '-50%',
                                    y: '-50%',
                                }}
                                initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
                                transition={
                                    reduced
                                        ? { duration: 0 }
                                        : {
                                              type: 'spring',
                                              damping: 28,
                                              stiffness: 380,
                                              duration: 0.25,
                                          }
                                }
                            >
                                {/* Header */}
                                <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border px-5">
                                    <Dialog.Title className="text-base font-semibold text-foreground tracking-tight">
                                        {title}
                                    </Dialog.Title>
                                    <Dialog.Close asChild>
                                        <button
                                            aria-label="Close"
                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-raised hover:text-foreground transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                        >
                                            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </Dialog.Close>
                                </div>

                                {/* Body — render children unconditionally so they
                                    stay mounted through Radix's exit animation.
                                    Previously `{open && children}` unmounted
                                    children the moment open flipped to false,
                                    losing form state mid-close. */}
                                <div className={`flex-1 overflow-y-auto p-5 ${hasFooter ? '' : 'pb-5'}`}>
                                    {children}
                                </div>

                                {/* Footer */}
                                {hasFooter && (
                                    <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-border px-5 py-3">
                                        <Button
                                            style={{ width: 90 }}
                                            content={cancelText}
                                            onClick={onCancel}
                                        />
                                        <Button
                                            style={{ width: 90 }}
                                            content={okText}
                                            onClick={onOk}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </Dialog.Content>
                    )}
                </AnimatePresence>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
