import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { SkeletonBox, SkeletonText, SkeletonCircle, SkeletonCard } from './Skeleton'

describe('Skeleton', () => {
    it('renders SkeletonBox', () => {
        const { container } = render(<SkeletonBox width={200} height={20} />)
        expect(container.firstChild).toBeTruthy()
    })

    it('renders the requested number of SkeletonText lines', () => {
        const { container } = render(<SkeletonText lines={3} />)
        // Three children for three lines
        expect(container.firstChild?.childNodes.length).toBe(3)
    })

    it('renders SkeletonCircle', () => {
        const { container } = render(<SkeletonCircle size={40} />)
        expect(container.firstChild).toBeTruthy()
    })

    it('renders SkeletonCard', () => {
        const { container } = render(<SkeletonCard />)
        expect(container.firstChild).toBeTruthy()
    })
})
