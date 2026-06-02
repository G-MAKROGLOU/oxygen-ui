import React, { createRef } from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Icon from './icons'
import { createIcon } from './createIcon'

describe('createIcon', () => {
    const Demo = createIcon('Demo', <path d="M0 0h24v24H0z" />)

    it('renders an svg sized 24 by default, coloured by currentColor', () => {
        const { container } = render(<Demo />)
        const svg = container.querySelector('svg')!
        expect(svg).toBeInTheDocument()
        expect(svg).toHaveAttribute('width', '24')
        expect(svg).toHaveAttribute('height', '24')
        expect(svg).toHaveAttribute('stroke', 'currentColor')
        expect(svg).toHaveAttribute('fill', 'none')
    })

    it('honours the size and strokeWidth props', () => {
        const { container } = render(<Demo size={40} strokeWidth={2} />)
        const svg = container.querySelector('svg')!
        expect(svg).toHaveAttribute('width', '40')
        expect(svg).toHaveAttribute('stroke-width', '2')
    })

    it('is decorative (aria-hidden) by default', () => {
        const { container } = render(<Demo />)
        const svg = container.querySelector('svg')!
        expect(svg).toHaveAttribute('aria-hidden', 'true')
        expect(svg).not.toHaveAttribute('aria-label')
    })

    it('exposes role=img + a label when given a title', () => {
        const { container, getByTitle } = render(<Demo title="Demo icon" />)
        const svg = container.querySelector('svg')!
        expect(svg).toHaveAttribute('role', 'img')
        expect(svg).toHaveAttribute('aria-label', 'Demo icon')
        expect(getByTitle('Demo icon')).toBeInTheDocument()
        expect(svg).not.toHaveAttribute('aria-hidden')
    })

    it('renders solid icons with fill and no stroke', () => {
        const Solid = createIcon('Solid', <path d="M12 4l8 16H4z" />, { solid: true })
        const { container } = render(<Solid />)
        const svg = container.querySelector('svg')!
        expect(svg).toHaveAttribute('fill', 'currentColor')
        expect(svg).not.toHaveAttribute('stroke')
    })

    it('forwards className/style and a ref', () => {
        const ref = createRef<SVGSVGElement>()
        const { container } = render(<Demo ref={ref} className="text-accent" />)
        const svg = container.querySelector('svg')!
        expect(svg).toHaveClass('text-accent')
        expect(ref.current).toBe(svg)
    })

    it('sets a displayName', () => {
        expect(Demo.displayName).toBe('Demo')
    })
})

describe('Icon pack', () => {
    it('exposes the common icons + back-compat aliases', () => {
        for (const name of ['ChevronDown', 'Search', 'Trash', 'Settings', 'Check', 'X', 'Spinner']) {
            expect(Icon[name as keyof typeof Icon]).toBeTruthy()
        }
        // legacy names still resolve
        expect(Icon.XClose).toBe(Icon.X)
        expect(Icon.Delete).toBe(Icon.Trash)
        expect(Icon.Cog).toBe(Icon.Settings)
        expect(Icon.Checked).toBe(Icon.Check)
    })

    it('every namespace entry renders an svg', () => {
        for (const [name, Glyph] of Object.entries(Icon)) {
            const { container, unmount } = render(<Glyph />)
            expect(container.querySelector('svg'), `${name} should render an <svg>`).toBeInTheDocument()
            unmount()
        }
    })
})
