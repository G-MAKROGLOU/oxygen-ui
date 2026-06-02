import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { cx } from '../../utils/cx'

export interface ParallaxProps {
    /** Background image URL, or any node (e.g. an illustration) to park behind the content. */
    background: React.ReactNode | string
    /** Foreground content, vertically + horizontally centred. */
    children?: React.ReactNode
    /** Frame height. Default `440`. */
    height?: number | string
    /**
     * How far the background drifts relative to scroll, as a fraction of the
     * frame height. `0` = static, `0.3` = moves 30%. Default `0.3`.
     */
    speed?: number
    /** Dim the background with a scrim for text legibility. Default `true`. */
    overlay?: boolean
    className?: string
    style?: React.CSSProperties
}

const isUrl = (v: React.ReactNode): v is string => typeof v === 'string'

/**
 * A scroll-driven parallax band: the background drifts slower than the page as
 * the frame passes through the viewport, with centred foreground content over
 * an optional scrim. Honours `prefers-reduced-motion` (background stays still).
 *
 * @example
 * <Parallax background="/img/ocean.jpg" height={520}>
 *   <h2 className="text-4xl font-bold text-white">Built for the open sea</h2>
 * </Parallax>
 */
export default function Parallax({
    background,
    children,
    height = 440,
    speed = 0.3,
    overlay = true,
    className = '',
    style,
}: ParallaxProps) {
    const reduced = useReducedMotion()
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
    const shift = Math.max(0, Math.min(1, speed)) * 100
    const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : [`-${shift / 2}%`, `${shift / 2}%`])

    return (
        <div
            ref={ref}
            className={cx('relative overflow-hidden rounded-2xl', className)}
            style={{ height, ...style }}
        >
            <motion.div
                aria-hidden={isUrl(background) ? true : undefined}
                className="absolute inset-x-0 -top-[15%] -bottom-[15%] will-change-transform"
                style={{
                    y,
                    ...(isUrl(background)
                        ? { backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : {}),
                }}
            >
                {!isUrl(background) && background}
            </motion.div>

            {overlay && (
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'color-mix(in oklab, var(--color-foreground) 45%, transparent)' }}
                    aria-hidden="true"
                />
            )}

            <div className="relative flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                {children}
            </div>
        </div>
    )
}
