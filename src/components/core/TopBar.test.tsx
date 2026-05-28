import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TopBar from './TopBar'

describe('TopBar', () => {
    it('renders the brand slot', () => {
        render(<TopBar brand={<span>BrandX</span>} />)
        expect(screen.getByText('BrandX')).toBeInTheDocument()
    })

    it('renders the actions slot', () => {
        render(<TopBar actions={<button>Sign out</button>} />)
        expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    })

    it('renders all three slots simultaneously', () => {
        render(
            <TopBar
                brand={<span>BrandX</span>}
                center={<span>Centered</span>}
                actions={<button>Sign out</button>}
            />
        )
        expect(screen.getByText('BrandX')).toBeInTheDocument()
        expect(screen.getByText('Centered')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
    })
})
