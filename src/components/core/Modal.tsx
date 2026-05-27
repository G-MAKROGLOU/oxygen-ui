import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import Button from '../inputs/Button'
import COLORS from '../../utils/colors'

export interface ModalProps {
    /** Pixel dimensions [width, height] */
    size?: [number, number]
    isOpen?: boolean
    onClose?: () => void
    onOk?: () => void
    onCancel?: () => void
    okText?: string
    cancelText?: string
    hasFooter?: boolean
    title?: React.ReactNode
    children?: React.ReactNode
}

/**
 * Centred modal dialog powered by Radix Dialog.
 *
 * The Radix primitive handles focus-trap, escape-to-close, and ARIA roles.
 * The VesOPS visual style (scale-in animation, prussian-blue header) is preserved.
 *
 * @example
 * <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm" onOk={handleOk}>
 *   Are you sure?
 * </Modal>
 */
export default function Modal({
    size = [600, 400],
    isOpen = false,
    onClose,
    onOk,
    onCancel,
    okText = 'Ok',
    cancelText = 'Cancel',
    hasFooter = true,
    title,
    children,
}: ModalProps) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose?.() }}>
            <Dialog.Portal>
                {/* Backdrop */}
                <Dialog.Overlay className="fixed inset-0 bg-oxford-blue-700-opaque z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-all duration-300" />

                {/* Panel */}
                <Dialog.Content
                    style={{ width: size[0], height: size[1] }}
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 shadow-md rounded-lg bg-white dark:bg-prussian-blue p-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-300 focus:outline-none"
                >
                    {/* Header */}
                    <div className="h-[12%] flex items-center justify-between border-b border-ice dark:border-independence p-2">
                        <Dialog.Title className="text-prussian-blue dark:text-white font-bold text-lg">
                            {title}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                aria-label="Close"
                                className="cursor-pointer rounded p-1 hover:bg-ice dark:hover:bg-independence transition-colors"
                            >
                                {/* XClose icon */}
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 5L5 15M5 5l10 10" stroke={COLORS.PALETTE['prussian-blue']} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-white" />
                                </svg>
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Body */}
                    <div className={`${hasFooter ? 'max-h-[77%]' : 'max-h-[90%]'} p-2 overflow-y-auto`}>
                        {isOpen && children}
                    </div>

                    {/* Footer */}
                    {hasFooter && (
                        <div className="flex justify-end items-center gap-5 border-t border-ice dark:border-independence h-max p-2">
                            <Button
                                style={{ width: 100, margin: '0' }}
                                content={cancelText}
                                onClick={onCancel}
                            />
                            <Button
                                style={{ width: 100, margin: '0' }}
                                content={okText}
                                onClick={onOk}
                            />
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
