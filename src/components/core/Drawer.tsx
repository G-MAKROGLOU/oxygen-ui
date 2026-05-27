import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import Button from '../inputs/Button'
import COLORS from '../../utils/colors'

export interface DrawerProps {
    isOpen?: boolean
    onClose?: () => void
    hasFooter?: boolean
    /** 'left' | 'right' */
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
 * Side-sliding drawer panel powered by Radix Dialog.
 *
 * Radix handles focus-trap, escape-to-close, and ARIA roles.
 * The drawer slides in from the left or right depending on `placement`.
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
    const isRight = placement === 'right'

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose?.() }}>
            <Dialog.Portal>
                {/* Backdrop */}
                <Dialog.Overlay className="fixed inset-0 bg-oxford-blue-700-opaque z-[5000] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300" />

                {/* Panel */}
                <Dialog.Content
                    style={{ width }}
                    className={`fixed top-0 bottom-0 ${isRight ? 'right-0 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right' : 'left-0 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left'} z-[5000] h-full shadow-md bg-white dark:bg-prussian-blue p-1 data-[state=open]:animate-in data-[state=closed]:animate-out duration-300 focus:outline-none`}
                >
                    {/* Header */}
                    <div
                        className={`h-[5%] border-b border-ice dark:border-independence p-2 flex items-center justify-between ${isRight && 'flex-row-reverse'}`}
                    >
                        <Dialog.Title className="text-prussian-blue dark:text-white font-bold text-lg">
                            {title}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                aria-label="Close drawer"
                                className="cursor-pointer rounded p-1 hover:bg-ice dark:hover:bg-independence transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 5L5 15M5 5l10 10" stroke={COLORS.PALETTE['prussian-blue']} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-white" />
                                </svg>
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Body */}
                    <div className={`${hasFooter ? 'h-[88%]' : 'h-[95%]'} overflow-y-auto`}>
                        {isOpen && children}
                    </div>

                    {/* Footer */}
                    {hasFooter && (
                        <div
                            className={`gap-5 h-[7%] pr-2 pl-2 border-t border-ice dark:border-independence flex items-center ${isRight ? 'justify-start' : 'justify-end'}`}
                        >
                            <Button style={{ width: 100 }} content={cancelText} onClick={onCancel} />
                            <Button style={{ width: 100 }} content={okText} onClick={onOk} />
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
