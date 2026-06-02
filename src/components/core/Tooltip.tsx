import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cx } from '../../utils/cx'

export interface TooltipProps {
    children: React.ReactNode
    /** The text or node shown inside the tooltip */
    title: React.ReactNode
    /** Which side of the trigger the tooltip appears on */
    placement?: 'top' | 'right' | 'bottom' | 'left'
    /** Delay before showing, ms (default 300) */
    delayDuration?: number
    /** Offset from trigger in px (default 8) */
    sideOffset?: number
    /** Extra classes merged onto the tooltip content bubble. */
    className?: string
}

// Each placement animates in from the opposite edge (toward the trigger)
const ANIMATION: Record<NonNullable<TooltipProps['placement']>, string> = {
    top:    'data-[state=delayed-open]:animate-tooltip-in-top',
    bottom: 'data-[state=delayed-open]:animate-tooltip-in-bottom',
    left:   'data-[state=delayed-open]:animate-tooltip-in-left',
    right:  'data-[state=delayed-open]:animate-tooltip-in-right',
}

/**
 * Tooltip powered by Radix Tooltip.
 *
 * Radix handles keyboard navigation (Escape), pointer events, and ARIA.
 * Each placement animates in from the correct direction.
 * Wrap your app in `<TooltipProvider>` (re-exported below) to share a
 * single provider instead of nesting one per tooltip.
 *
 * @example
 * <TooltipProvider>
 *   <Tooltip title="Delete record" placement="top">
 *     <IconButton icon={<TrashIcon />} />
 *   </Tooltip>
 * </TooltipProvider>
 */
export default function Tooltip({
    children,
    title,
    placement = 'top',
    delayDuration = 300,
    sideOffset = 8,
    className = '',
}: TooltipProps) {
    return (
        <TooltipPrimitive.Provider delayDuration={delayDuration}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    <span className="inline-flex">{children}</span>
                </TooltipPrimitive.Trigger>

                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        side={placement}
                        sideOffset={sideOffset}
                        className={cx(
                            // Layout + typography
                            'pointer-events-none z-[500000] max-w-[220px] px-2.5 py-1.5',
                            // Inverted surface: dark on light, light on dark — both readable
                            'bg-foreground text-background',
                            'text-xs font-medium leading-snug',
                            // Shape + shadow
                            'rounded-md shadow-md',
                            // Out animation (always the same — just fade)
                            'data-[state=closed]:animate-tooltip-out',
                            // In animation — direction-aware
                            ANIMATION[placement],
                            className,
                        )}
                    >
                        {title}
                        <TooltipPrimitive.Arrow
                            width={10}
                            height={5}
                            className="fill-foreground"
                        />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    )
}

export { TooltipPrimitive as TooltipPrimitives }
export const TooltipProvider = TooltipPrimitive.Provider
