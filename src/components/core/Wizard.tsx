import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '../inputs/Button'

export interface WizardStep {
    /** Ref to the DOM element to highlight */
    stepRef: React.RefObject<HTMLElement>
    description: React.ReactNode
    /** 'natural' | 'center' — controls tooltip position relative to target */
    positioning?: 'natural' | 'center'
}

export interface WizardProps {
    children: React.ReactNode
    steps: WizardStep[]
    /** localStorage key used to remember dismissal (default: 'oxygen_wizard') */
    storageKey?: string
}

/**
 * Guided-tour overlay wizard.
 *
 * Highlights a DOM element via a border, then shows a floating tooltip
 * adjacent to it. Remembers dismissal via localStorage.
 *
 * @example
 * const step1Ref = useRef<HTMLDivElement>(null)
 * const steps = [
 *   { stepRef: step1Ref, description: 'Click here to start.', positioning: 'natural' },
 * ]
 * <Wizard steps={steps}>
 *   <div ref={step1Ref}>...</div>
 * </Wizard>
 */
export default function Wizard({ children, steps, storageKey = 'po_wizard' }: WizardProps) {
    const wizardRef = useRef<HTMLDivElement>(null)
    const [activeStep, setActiveStep] = useState(0)
    const [targetBbox, setTargetBbox] = useState<DOMRect | null>(null)

    const HIGHLIGHTED = useMemo(
        () => ['border', 'border-4', 'border-prussian-blue', 'pointer-events-none'] as string[],
        []
    )

    const closeWizard = useCallback(() => {
        steps[activeStep]?.stepRef.current?.classList.remove(...HIGHLIGHTED)
        if (wizardRef.current) wizardRef.current.style.display = 'none'
    }, [HIGHLIGHTED, steps, activeStep])

    useEffect(() => {
        const visited = JSON.parse(localStorage.getItem(storageKey) ?? 'false')
        if (visited) {
            closeWizard()
            return
        }
        const el = steps[activeStep]?.stepRef.current
        if (el) {
            setTargetBbox(el.getBoundingClientRect())
            el.classList.add(...HIGHLIGHTED)
        }
    }, [closeWizard, steps, activeStep, HIGHLIGHTED, storageKey])

    const onStepChange = () => {
        if (steps[activeStep + 1]) {
            steps[activeStep].stepRef.current?.classList.remove(...HIGHLIGHTED)
            const nextEl = steps[activeStep + 1].stepRef.current
            if (nextEl) setTargetBbox(nextEl.getBoundingClientRect())
            setActiveStep(activeStep + 1)
        } else {
            localStorage.setItem(storageKey, 'true')
            closeWizard()
        }
    }

    const step = steps[activeStep]
    const left = step && targetBbox
        ? step.positioning === 'natural'
            ? isNaN(targetBbox.width + 20) ? 0 : targetBbox.width + 20
            : isNaN(targetBbox.width / 2) ? 0 : targetBbox.width / 2
        : 'auto'
    const top = step && targetBbox
        ? step.positioning === 'natural'
            ? isNaN(targetBbox.y + 10) ? 0 : targetBbox.y + 10
            : isNaN(targetBbox.height / 2) ? 0 : targetBbox.height / 2
        : 'auto'

    return (
        <div className="h-full p-1 rounded-lg w-full">
            <div className="absolute" ref={wizardRef}>
                <div
                    style={{ left, top }}
                    className="absolute bg-white rounded-lg p-2 w-[220px] z-50 text-prussian-blue drop-shadow-md transition-all duration-300"
                >
                    {step?.description}
                    <div className="flex justify-end">
                        <span className="flex h-3 w-3 relative left-14 top-4">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-dark-cornflower-blue opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-dark-cornflower-blue" />
                        </span>
                        <Button
                            onClick={onStepChange}
                            content={activeStep === steps.length - 1 ? 'Close' : 'Next'}
                            style={{ width: 55, padding: '5px 10px', margin: '0' }}
                        />
                    </div>
                </div>
            </div>
            {children}
        </div>
    )
}
