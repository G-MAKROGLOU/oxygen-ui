import React from 'react'
import Box, { type BoxProps, type Spacing } from './Box'

export type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse'
export type FlexAlign     = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type FlexJustify   = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
export type FlexWrap      = 'nowrap' | 'wrap' | 'wrap-reverse'

const GAP_MAP: Record<Spacing, string> = {
    'none': 'gap-0',
    'xs':   'gap-1',
    'sm':   'gap-2',
    'md':   'gap-4',
    'lg':   'gap-6',
    'xl':   'gap-8',
    '2xl':  'gap-12',
}

const DIRECTION_CLASS: Record<FlexDirection, string> = {
    'row':         'flex-row',
    'row-reverse': 'flex-row-reverse',
    'col':         'flex-col',
    'col-reverse': 'flex-col-reverse',
}
const ALIGN_CLASS: Record<FlexAlign, string> = {
    start:    'items-start',
    center:   'items-center',
    end:      'items-end',
    stretch:  'items-stretch',
    baseline: 'items-baseline',
}
const JUSTIFY_CLASS: Record<FlexJustify, string> = {
    start:   'justify-start',
    center:  'justify-center',
    end:     'justify-end',
    between: 'justify-between',
    around:  'justify-around',
    evenly:  'justify-evenly',
}
const WRAP_CLASS: Record<FlexWrap, string> = {
    'nowrap':       'flex-nowrap',
    'wrap':         'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
}

export interface FlexProps extends BoxProps {
    direction?: FlexDirection
    align?: FlexAlign
    justify?: FlexJustify
    wrap?: FlexWrap
    /** Gap between children — uses the same spacing token scale as Box. */
    gap?: Spacing
    inline?: boolean
}

/**
 * `Box` with `display: flex` baked in. All Box props are accepted (padding,
 * margin, background, border, etc.) plus flex-specific controls.
 *
 * @example Horizontal row, centred, with gap
 * ```tsx
 * <Flex direction="row" align="center" gap="md">
 *   <Avatar src={user.photo} alt={user.name} />
 *   <Typography variant="body">{user.name}</Typography>
 * </Flex>
 * ```
 *
 * @example Vertical stack
 * ```tsx
 * <Flex direction="col" gap="sm">
 *   <Typography variant="h3">Title</Typography>
 *   <Typography variant="body">Body text</Typography>
 * </Flex>
 * ```
 */
export default function Flex({
    direction = 'row',
    align,
    justify,
    wrap,
    gap,
    inline,
    className = '',
    ...boxProps
}: FlexProps) {
    return (
        <Box
            {...boxProps}
            className={[
                inline ? 'inline-flex' : 'flex',
                DIRECTION_CLASS[direction],
                align    ? ALIGN_CLASS[align]      : '',
                justify  ? JUSTIFY_CLASS[justify]  : '',
                wrap     ? WRAP_CLASS[wrap]        : '',
                gap      ? GAP_MAP[gap]            : '',
                className,
            ].filter(Boolean).join(' ')}
        />
    )
}
