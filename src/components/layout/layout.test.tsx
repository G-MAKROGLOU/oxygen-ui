import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Box from './Box'
import Grid from './Grid'

describe('Box spacing props', () => {
    it('emits a static class plus a CSS variable per spacing prop', () => {
        const { container } = render(<Box p="md" mx="sm" pt="xl" />)
        const el = container.firstElementChild as HTMLElement
        expect(el.classList.contains('oxy-p')).toBe(true)
        expect(el.classList.contains('oxy-mx')).toBe(true)
        expect(el.classList.contains('oxy-pt')).toBe(true)
        expect(el.style.getPropertyValue('--oxy-p')).toBe('1rem')
        expect(el.style.getPropertyValue('--oxy-mx')).toBe('0.5rem')
        expect(el.style.getPropertyValue('--oxy-pt')).toBe('2rem')
    })

    it('emits nothing for absent spacing props', () => {
        const { container } = render(<Box />)
        const el = container.firstElementChild as HTMLElement
        expect(el.getAttribute('class') ?? '').not.toContain('oxy-')
        expect(el.getAttribute('style')).toBeNull()
    })

    it('covers the whole token scale', () => {
        const { container } = render(
            <>
                <Box p="none" /><Box p="xs" /><Box p="sm" /><Box p="md" />
                <Box p="lg" /><Box p="xl" /><Box p="2xl" />
            </>,
        )
        const values = Array.from(container.children).map((el) => (el as HTMLElement).style.getPropertyValue('--oxy-p'))
        expect(values).toEqual(['0px', '0.25rem', '0.5rem', '1rem', '1.5rem', '2rem', '3rem'])
    })
})

describe('Grid gap props', () => {
    it('emits static gap classes with CSS variables', () => {
        const { container } = render(<Grid gap="md" gapX="lg" gapY="xs" cols={3} />)
        const el = container.firstElementChild as HTMLElement
        expect(el.classList.contains('grid')).toBe(true)
        expect(el.classList.contains('grid-cols-3')).toBe(true)
        expect(el.classList.contains('oxy-gap')).toBe(true)
        expect(el.classList.contains('oxy-gap-x')).toBe(true)
        expect(el.classList.contains('oxy-gap-y')).toBe(true)
        expect(el.style.getPropertyValue('--oxy-gap')).toBe('1rem')
        expect(el.style.getPropertyValue('--oxy-gap-x')).toBe('1.5rem')
        expect(el.style.getPropertyValue('--oxy-gap-y')).toBe('0.25rem')
    })

    it('keeps string templates as inline styles', () => {
        const { container } = render(<Grid cols="200px 1fr" />)
        const el = container.firstElementChild as HTMLElement
        expect(el.style.gridTemplateColumns).toBe('200px 1fr')
    })
})
