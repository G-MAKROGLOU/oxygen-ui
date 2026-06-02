import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Jumbotron from './Jumbotron'
import FeatureGrid from './FeatureGrid'
import PricingPlans from './PricingPlans'
import Testimonials from './Testimonials'

describe('Jumbotron', () => {
    it('renders title, description and actions', () => {
        render(<Jumbotron title="Hello world" description="A subtitle" actions={<button>CTA</button>} />)
        expect(screen.getByRole('heading', { name: 'Hello world' })).toBeInTheDocument()
        expect(screen.getByText('A subtitle')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'CTA' })).toBeInTheDocument()
    })
    it('renders media in split layout', () => {
        render(<Jumbotron title="T" layout="split" media={<img alt="hero" src="x" />} />)
        expect(screen.getByAltText('hero')).toBeInTheDocument()
    })
})

describe('FeatureGrid', () => {
    it('renders every feature and the header', () => {
        render(<FeatureGrid title="Features" features={[{ title: 'A', description: 'a' }, { title: 'B', description: 'b' }]} />)
        expect(screen.getByRole('heading', { name: 'Features' })).toBeInTheDocument()
        expect(screen.getByText('A')).toBeInTheDocument()
        expect(screen.getByText('B')).toBeInTheDocument()
    })
})

describe('PricingPlans', () => {
    it('renders plans, badge, and fires the CTA', () => {
        const onClick = vi.fn()
        render(<PricingPlans plans={[
            { name: 'Starter', price: '$0', features: ['x'], cta: { label: 'Start' } },
            { name: 'Pro', price: '$49', highlighted: true, badge: 'Popular', features: ['y'], cta: { label: 'Go Pro', onClick } },
        ]} />)
        expect(screen.getByText('Popular')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Go Pro' }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})

describe('Testimonials', () => {
    it('renders quotes and authors', () => {
        render(<Testimonials testimonials={[{ quote: 'Great product', author: 'Jane Doe', role: 'CTO', rating: 5 }]} />)
        expect(screen.getByText(/Great product/)).toBeInTheDocument()
        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
        expect(screen.getByText('CTO')).toBeInTheDocument()
        expect(screen.getByLabelText('5 out of 5')).toBeInTheDocument()
    })
})
