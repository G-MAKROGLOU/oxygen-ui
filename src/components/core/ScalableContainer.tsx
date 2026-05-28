import React, { useRef, useState } from 'react'
import Tooltip from './Tooltip'
import IconButton from './IconButton'

export interface ScalableContainerProps {
    width?: React.CSSProperties['width']
    height?: React.CSSProperties['height']
    children?: React.ReactNode
    /** CSS class applied to the children wrapper when expanded */
    assignClassOnClick?: string
}

/**
 * Container that can be expanded to fill its parent, with a tooltip-annotated
 * expand/collapse icon button.
 *
 * @example
 * <ScalableContainer width="50%" height={300}>
 *   <Chart data={data} />
 * </ScalableContainer>
 */
export default function ScalableContainer({
    width,
    height,
    children,
    assignClassOnClick,
}: ScalableContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isScaled, setScaled] = useState(false)
    const [wrapperClass, setWrapperClass] = useState('')

    const onClick = () => {
        const next = !isScaled
        setScaled(next)
        setTimeout(() => {
            containerRef.current?.scrollIntoView({ behavior: 'smooth' })
            if (assignClassOnClick) {
                setWrapperClass(next ? assignClassOnClick : '')
            }
        }, 200)
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: isScaled ? '100%' : width,
                height: isScaled ? '100%' : height,
            }}
            className="rounded-lg bg-surface-raised flex flex-col transition-all duration-300 origin-center"
        >
            <div className="p-2 w-max">
                <Tooltip placement="right" title={isScaled ? 'Collapse' : 'Expand'}>
                    <IconButton
                        onClick={onClick}
                        icon={
                            isScaled ? (
                                /* Collapse (arrows-pointing-in) */
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M3.22 3.22a.75.75 0 011.06 0l3.97 3.97V4.5a.75.75 0 011.5 0V9a.75.75 0 01-.75.75H4.5a.75.75 0 010-1.5h2.69L3.22 4.28a.75.75 0 010-1.06zm17.56 0a.75.75 0 010 1.06l-3.97 3.97h2.69a.75.75 0 010 1.5H15a.75.75 0 01-.75-.75V4.5a.75.75 0 011.5 0v2.69l3.97-3.97a.75.75 0 011.06 0zM3.75 15a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-2.69l-3.97 3.97a.75.75 0 01-1.06-1.06l3.97-3.97H4.5a.75.75 0 01-.75-.75zm10.5 0a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75 .75.75 0 01-.75.75h-2.69l3.97 3.97a.75.75 0 11-1.06 1.06l-3.97-3.97v2.69a.75.75 0 01-1.5 0V15z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                /* Expand (arrows-pointing-out) */
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M15 3a.75.75 0 01.75-.75h5.25A.75.75 0 0121 3v5.25a.75.75 0 01-1.5 0V4.81l-5.72 5.72a.75.75 0 11-1.06-1.06L18.19 3.75H15.75A.75.75 0 0115 3zM3 15a.75.75 0 01.75-.75h2.44l5.72-5.72a.75.75 0 111.06 1.06l-5.72 5.72v2.44a.75.75 0 01-1.5 0V15.75A.75.75 0 013 15zm0-11.25A.75.75 0 013.75 3h5.25a.75.75 0 010 1.5H4.81l5.72 5.72a.75.75 0 11-1.06 1.06L3.75 5.56V8.25a.75.75 0 01-1.5 0V3.75A.75.75 0 013 3zm18 12a.75.75 0 01-.75.75h-5.25a.75.75 0 010-1.5h2.44l-5.72-5.72a.75.75 0 111.06-1.06l5.72 5.72v-2.44a.75.75 0 011.5 0V15z" clipRule="evenodd" />
                                </svg>
                            )
                        }
                    />
                </Tooltip>
            </div>
            <div className={wrapperClass}>{children}</div>
        </div>
    )
}
