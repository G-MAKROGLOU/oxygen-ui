import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Statistic from './Statistic'

describe('Statistic', () => {
    it('renders label, value, prefix and suffix', () => {
        render(<Statistic label="Revenue" value="48,210" prefix="$" suffix="USD" />)
        expect(screen.getByText('Revenue')).toBeInTheDocument()
        expect(screen.getByText('48,210')).toBeInTheDocument()
        expect(screen.getByText('$')).toBeInTheDocument()
        expect(screen.getByText('USD')).toBeInTheDocument()
    })

    it('colours an up delta green by default', () => {
        render(<Statistic label="Rev" value="1" delta={{ value: '12%', direction: 'up' }} />)
        const delta = screen.getByText('12%').closest('div')
        expect(delta?.className).toContain('text-status-success')
    })

    it('flips delta colour when positiveIsGood is false', () => {
        render(<Statistic label="Churn" value="3" delta={{ value: '1%', direction: 'up', positiveIsGood: false }} />)
        const delta = screen.getByText('1%').closest('div')
        expect(delta?.className).toContain('text-status-error')
    })
})
