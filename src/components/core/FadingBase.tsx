import React, { useEffect, useRef, useState } from 'react'

export interface FadingBaseProps {
    className?: string
    /** Controls mount/unmount with fade transition */
    isMounted?: boolean
    children?: React.ReactNode
}

/**
 * Fade-in / fade-out page container.
 *
 * Replaces `react-transition-group` with a pure CSS opacity transition.
 * The component mounts on `isMounted=true` and unmounts after the 300ms
 * fade-out completes on `isMounted=false`.
 *
 * Uses CSS `dark:` class for the glass effect — no ThemeContext dependency.
 *
 * @example
 * <FadingBase isMounted={isPageVisible}>
 *   <PageContent />
 * </FadingBase>
 */
export default function FadingBase({
    className = '',
    isMounted = false,
    children,
}: FadingBaseProps) {
    const [shouldRender, setShouldRender] = useState(isMounted)
    const [visible, setVisible] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (isMounted) {
            setShouldRender(true)
            // rAF gives the DOM time to paint before triggering the transition
            const rafId = requestAnimationFrame(() => setVisible(true))
            return () => cancelAnimationFrame(rafId)
        } else {
            setVisible(false)
            timerRef.current = setTimeout(() => setShouldRender(false), 300)
            return () => {
                if (timerRef.current) clearTimeout(timerRef.current)
            }
        }
    }, [isMounted])

    if (!shouldRender) return null

    return (
        <div
            className={`w-full calculated-height pl-2 pr-2 pb-2 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className={`bg-ice dark:glassmorphism w-full h-full rounded-lg p-2 ${className}`}>
                {children}
            </div>
        </div>
    )
}
