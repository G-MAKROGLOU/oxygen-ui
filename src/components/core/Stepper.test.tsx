import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Stepper, { type StepperStep } from './Stepper'

const steps: StepperStep[] = [
    { key: 'a', title: 'Cart' },
    { key: 'b', title: 'Address' },
    { key: 'c', title: 'Payment' },
]

describe('Stepper', () => {
    it('renders every step title', () => {
        render(<Stepper steps={steps} current={1} />)
        expect(screen.getByText('Cart')).toBeInTheDocument()
        expect(screen.getByText('Address')).toBeInTheDocument()
        expect(screen.getByText('Payment')).toBeInTheDocument()
    })

    it('numbers the active and pending steps but not the completed one', () => {
        render(<Stepper steps={steps} current={1} />)
        // step 0 completed → check icon, no "1"; step 1 active → "2"; step 2 pending → "3"
        expect(screen.queryByText('1')).toBeNull()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('marks the active step with aria-current="step"', () => {
        render(<Stepper steps={steps} current={0} />)
        expect(document.querySelector('[aria-current="step"]')).not.toBeNull()
    })

    it('shows a spinner on the active step when status is loading', () => {
        const { container } = render(<Stepper steps={steps} current={1} status="loading" />)
        expect(container.querySelector('.animate-spin')).not.toBeNull()
    })
})
