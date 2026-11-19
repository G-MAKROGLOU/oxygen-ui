import React from 'react'
import Box, { SPACING_REM, type BoxProps, type Spacing } from './Box'
import { cx } from '../../utils/cx'

const COL_MAP: Record<number, string> = {
    1: 'grid-cols-1',  2: 'grid-cols-2',  3: 'grid-cols-3',  4: 'grid-cols-4',
    5: 'grid-cols-5',  6: 'grid-cols-6',  7: 'grid-cols-7',  8: 'grid-cols-8',
    9: 'grid-cols-9', 10: 'grid-cols-10', 11: 'grid-cols-11', 12: 'grid-cols-12',
}

const ROW_MAP: Record<number, string> = {
    1: 'grid-rows-1', 2: 'grid-rows-2', 3: 'grid-rows-3',
    4: 'grid-rows-4', 5: 'grid-rows-5', 6: 'grid-rows-6',
}

export interface GridProps extends BoxProps {
    /**
     * Number of columns (1–12) for the most common case, OR an explicit
     * CSS grid-template-columns string for arbitrary layouts
     * (e.g. `"200px 1fr"` or `"repeat(auto-fit, minmax(180px, 1fr))"`).
     */
    cols?: number | string
    /** Same as `cols` but for rows. */
    rows?: number | string
    /** Uniform gap. Token scale, like Box's padding. */
    gap?: Spacing
    /** Horizontal-only gap (overrides `gap`). */
    gapX?: Spacing
    /** Vertical-only gap (overrides `gap`). */
    gapY?: Spacing
    /** Cross-axis alignment of items within their cell. */
    align?: 'start' | 'center' | 'end' | 'stretch'
    /** Main-axis alignment of items within their cell. */
    justify?: 'start' | 'center' | 'end' | 'stretch'
}

const ALIGN_CLASS = {
    start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch',
}
const JUSTIFY_CLASS = {
    start: 'justify-items-start', center: 'justify-items-center', end: 'justify-items-end', stretch: 'justify-items-stretch',
}

/**
 * `Box` with `display: grid` baked in. Use `cols` / `rows` as numbers for
 * the common "N equal tracks" case, or pass any CSS grid-template-* string
 * for arbitrary layouts (auto-fit grids, fixed-width sidebars, etc.).
 *
 * @example 3-column grid with medium gap
 * ```tsx
 * <Grid cols={3} gap="md">
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 * ```
 *
 * @example Auto-fit responsive grid
 * ```tsx
 * <Grid cols="repeat(auto-fit, minmax(220px, 1fr))" gap="lg">
 *   {items.map((it) => <Card key={it.id} {...it} />)}
 * </Grid>
 * ```
 */
export default function Grid({
    cols,
    rows,
    gap,
    gapX,
    gapY,
    align,
    justify,
    className = '',
    style,
    ...boxProps
}: GridProps) {
    // For numeric cols/rows, prefer the static Tailwind class so JIT picks it
    // up. For arbitrary strings, fall back to inline style.
    const colClass = typeof cols === 'number' ? (COL_MAP[cols] ?? '') : ''
    const rowClass = typeof rows === 'number' ? (ROW_MAP[rows] ?? '') : ''
    const inlineCols = typeof cols === 'string' ? cols : undefined
    const inlineRows = typeof rows === 'string' ? rows : undefined

    // Gap props set a static class plus a CSS custom property, like Box's
    // spacing props, so no runtime-built Tailwind class name exists.
    const gapVars: Record<string, string> = {}
    if (gap != null) gapVars['--oxy-gap'] = SPACING_REM[gap]
    if (gapX != null) gapVars['--oxy-gap-x'] = SPACING_REM[gapX]
    if (gapY != null) gapVars['--oxy-gap-y'] = SPACING_REM[gapY]

    return (
        <Box
            {...boxProps}
            className={cx(
                'grid',
                colClass,
                rowClass,
                gap  != null ? 'oxy-gap'   : '',
                gapX != null ? 'oxy-gap-x' : '',
                gapY != null ? 'oxy-gap-y' : '',
                align   ? ALIGN_CLASS[align]     : '',
                justify ? JUSTIFY_CLASS[justify] : '',
                className,
            )}
            style={{
                ...(gapVars as React.CSSProperties),
                gridTemplateColumns: inlineCols,
                gridTemplateRows:    inlineRows,
                ...style,
            }}
        />
    )
}
