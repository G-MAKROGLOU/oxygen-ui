import React, { useEffect, useMemo } from 'react'
import Portal from '../utils/Portal'

export interface LoadingSpinnerProps {
    /** Text animated letter by letter */
    prompt: string
}

/**
 * Full-screen loading overlay with a spinning shape and staggered text reveal.
 *
 * @example
 * {isLoading && <LoadingSpinner prompt="Loading data..." />}
 */
export default function LoadingSpinner({ prompt }: LoadingSpinnerProps) {
    const letterRefs = useMemo<(HTMLSpanElement | null)[]>(() => [], [])
    const letters = prompt.split('')

    useEffect(() => {
        const timeouts: ReturnType<typeof setTimeout>[] = []
        if (letterRefs.length === letters.length) {
            letterRefs.forEach((ref, index) => {
                const t = setTimeout(() => {
                    ref?.classList.add('slowly-appear')
                }, index * 100)
                timeouts.push(t)
            })
        }
        return () => timeouts.forEach(clearTimeout)
    }, [letterRefs, letters.length])

    return (
        // Portaled so the full-screen overlay always covers the real viewport,
        // not whatever container the consumer renders LoadingSpinner inside.
        <Portal>
            <div className="fixed top-0 bottom-0 right-0 left-0 bg-oxford-blue-700-opaque z-[8000000] flex flex-col gap-5 items-center justify-start pt-80">
                <div className="border-r-prussian-blue border-l-prussian-blue border-t-white border-b-white border-[10px] w-[80px] h-[80px] rounded-xl shapeshift" />
                <div className="text-prussian-blue dark:text-white text-3xl font-bold">
                    {letters.map((letter, index) => (
                        <span
                            key={index}
                            className="select-none"
                            ref={(ref) => {
                                letterRefs[index] = ref
                            }}
                        >
                            {letter}
                        </span>
                    ))}
                </div>
            </div>
        </Portal>
    )
}
