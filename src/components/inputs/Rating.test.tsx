import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Rating from './Rating'

function Harness({ onChange, ...rest }: { onChange?: (v: number) => void } & Partial<React.ComponentProps<typeof Rating>>) {
    const [v, setV] = useState(rest.defaultValue ?? 0)
    return <Rating label="Rate" {...rest} value={v} onChange={(val) => { setV(val); onChange?.(val) }} />
}

describe('Rating', () => {
    it('renders as an interactive slider when editable', () => {
        render(<Harness count={5} />)
        const el = screen.getByRole('slider', { name: 'Rate' })
        expect(el).toHaveAttribute('aria-valuemax', '5')
    })

    it('increments with ArrowRight', () => {
        const onChange = vi.fn()
        render(<Harness count={5} onChange={onChange} />)
        const el = screen.getByRole('slider')
        el.focus()
        fireEvent.keyDown(el, { key: 'ArrowRight' })
        expect(onChange).toHaveBeenLastCalledWith(1)
    })

    it('jumps to max on End', () => {
        const onChange = vi.fn()
        render(<Harness count={5} onChange={onChange} />)
        const el = screen.getByRole('slider')
        el.focus()
        fireEvent.keyDown(el, { key: 'End' })
        expect(onChange).toHaveBeenLastCalledWith(5)
    })

    it('renders as a non-interactive image when readOnly', () => {
        render(<Rating value={4} readOnly />)
        expect(screen.getByRole('img')).toBeInTheDocument()
        expect(screen.queryByRole('slider')).toBeNull()
    })
})
