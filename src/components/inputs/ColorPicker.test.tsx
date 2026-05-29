import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ColorPicker from './ColorPicker'

function Harness({ onChange, ...rest }: { onChange?: (v: string) => void } & Partial<React.ComponentProps<typeof ColorPicker>>) {
    const [v, setV] = useState(rest.value ?? '')
    return <ColorPicker label="Colour" {...rest} value={v} onChange={(val) => { setV(val); onChange?.(val) }} />
}

describe('ColorPicker', () => {
    it('shows the placeholder when unset', () => {
        render(<Harness placeholder="Pick" />)
        expect(screen.getByText('Pick')).toBeInTheDocument()
    })

    it('displays the selected hex', () => {
        render(<Harness value="#0466C8" />)
        expect(screen.getByText('#0466c8')).toBeInTheDocument()
    })

    it('picks a preset swatch', () => {
        const onChange = vi.fn()
        render(<Harness onChange={onChange} swatches={['#0466c8', '#1e8449']} />)
        // Trigger's accessible name is its associated label ("Colour").
        fireEvent.click(screen.getByRole('button', { name: /pick a colour/i }))
        fireEvent.click(screen.getByRole('button', { name: '#1e8449' }))
        expect(onChange).toHaveBeenCalledWith('#1e8449')
    })

    it('accepts a valid hex typed into the field', () => {
        const onChange = vi.fn()
        render(<Harness onChange={onChange} />)
        fireEvent.click(screen.getByRole('button', { name: /pick a colour/i }))
        fireEvent.change(screen.getByLabelText('Hex colour'), { target: { value: '#abcdef' } })
        expect(onChange).toHaveBeenLastCalledWith('#abcdef')
    })
})
