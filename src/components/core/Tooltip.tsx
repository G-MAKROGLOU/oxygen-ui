import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export interface TooltipProps {
    children: React.ReactNode
    title: React.ReactNode
    /** 'top' | 'right' | 'bottom' | 'left' */
    placement?: 'top' | 'right' | 'bottom' | 'left'
    /** Delay in ms before showing the tooltip */
    delayDuration?: number
}

/**
 * Tooltip powered by Radix Tooltip.
 *
 * Radix handles keyboard navigation (escape), pointer events, and ARIA.
 * The VesOPS prussian-blue style is preserved.
 *
 * Wrap your app in `<TooltipProvider>` (re-exported below) to batch providers.
 *
 * @example
 * <Tooltip title="Delete record" placement="right">
 *   <IconButton icon={<Icon.Trash />} />
 * </Tooltip>
 */
export default function Tooltip({
    children,
    title,
    placement = 'left',
    delayDuration = 400,
}: TooltipProps) {
    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    {/* Radix Trigger requires a single child element */}
                    <span className="h-max w-max">{children}</span>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={placement}
                        sideOffset={8}
                        className="pointer-events-none z-[500000000] rounded-lg bg-prussian-blue dark:bg-rich-black-fogra px-2 py-1.5 text-white text-sm w-max max-w-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                    >
                        {title}
                        <TooltipPrimitive.Arrow className="fill-prussian-blue dark:fill-rich-black-fogra" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    )
}

/** Re-export provider so consumers can wrap their app once instead of per-tooltip */
export { TooltipPrimitive as TooltipPrimitives }
export const TooltipProvider = TooltipPrimitive.Provider
