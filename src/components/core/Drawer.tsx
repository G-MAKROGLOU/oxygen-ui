import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Button from '../inputs/Button'

export interface DrawerProps {
    isOpen?: boolean
    onClose?: () => void
    hasFooter?: boolean
    /** 'left' | 'right' — which edge the panel slides from */
    placement?: 'left' | 'right'
    width?: number
    okText?: string
    cancelText?: string
    onOk?: () => void
    onCancel?: () => void
    title?: React.ReactNode
    children?: React.ReactNode
}

/**
 * Side-sliding drawer panel powered by Radix Dialog + Framer Motion.
 *
 * Radix handles focus-trap, escape-to-close, and ARIA roles.
 * Framer Motion drives the slide enter/exit animation.
 * prefers-reduced-motion is respected via useReducedMotion().
 *
 * @example
 * <Drawer isOpen={open} placement="right" onClose={() => setOpen(false)} title="Filters">
 *   <FilterForm />
 * </Drawer>
 */
export default function Drawer({
    isOpen = false,
    onClose,
    hasFooter = true,
    placement = 'right',
    width = 320,
    okText = 'Ok',
    cancelText = 'Cancel',
    onOk,
    onCancel,
    title,
    children,
}: DrawerProps) {
    const reduced = useReducedMotion()
    const isRight = placement === 'right'
    const hiddenX = isRight ? '100%' : '-100%'

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose?.() }}>
            <Dialog.Portal forceMount>
                {/* ── Backdrop ── */}
                <AnimatePresence>
                    {isOpen && (
                        <Dialog.Overlay asChild>
                            <motion.div
                                className="fixed inset-0 bg-oxford-blue-700-opaque z-[5000]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}
                            />
                        </Dialog.Overlay>
                    )}
                </AnimatePresence>

                {/* ── Panel ── */}
                <AnimatePresence>
                    {isOpen && (
                        <Dialog.Content asChild>
                            <motion.div
                                className={`fixed top-0 bottom-0 ${isRight ? 'right-0' : 'left-0'} z-[5000] flex flex-col bg-white dark:bg-prussian-blue shadow-2xl shadow-black/25 focus:outline-none`}
                                style={{ width }}
                                initial={{ x: reduced ? 0 : hiddenX, opacity: reduced ? 0 : 1 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: reduced ? 0 : hiddenX, opacity: reduced ? 0 : 1 }}
                                transition={
                                    reduced
                                        ? { duration: 0 }
                                        : {
                                              x: {
                                                  type: 'tween',
                                                  duration: 0.26,
                                                  ease: [0.16, 1, 0.3, 1], // ease-out-expo
                                              },
                                              opacity: { duration: 0 },
                                          }
                                }
                            >
                                {/* Header */}
                                <div className={`flex h-14 flex-shrink-0 items-center justify-between border-b border-ice dark:border-independence px-5 ${isRight ? 'flex-row-reverse' : ''}`}>
                                    <Dialog.Title className="text-base font-semibold text-prussian-blue dark:text-white tracking-tight">
                                        {title}
                                    </Dialog.Title>
                                    <Dialog.Close asChild>
                                        <button
                                            aria-label="Close drawer"
                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-black-coral dark:text-manatee hover:bg-ice hover:text-prussian-blue dark:hover:bg-oxford-blue-700 dark:hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-true-blue"
                                        >
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                                                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </Dialog.Close>
                                </div>

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto p-5">
                                    {isOpen && children}
                                </div>

                                {/* Footer */}
                                {hasFooter && (
                                    <div className={`flex flex-shrink-0 items-center gap-3 border-t border-ice dark:border-independence px-5 py-3 ${isRight ? 'justify-start' : 'justify-end'}`}>
                                        <Button style={{ width: 90 }} content={cancelText} onClick={onCancel} />
                                        <Button style={{ width: 90 }} content={okText} onClick={onOk} />
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
