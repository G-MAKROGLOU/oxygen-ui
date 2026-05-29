import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TagsInput from './TagsInput'

function Harness({ onChange, ...rest }: { onChange?: (t: string[]) => void } & Partial<React.ComponentProps<typeof TagsInput>>) {
    const [tags, setTags] = useState<string[]>(rest.defaultValue ?? [])
    return <TagsInput label="Tags" {...rest} value={tags} onChange={(t) => { setTags(t); onChange?.(t) }} />
}

describe('TagsInput', () => {
    it('renders initial tags', () => {
        render(<Harness defaultValue={['alpha', 'beta']} />)
        expect(screen.getByText('alpha')).toBeInTheDocument()
        expect(screen.getByText('beta')).toBeInTheDocument()
    })

    it('adds a tag on Enter', () => {
        const onChange = vi.fn()
        render(<Harness onChange={onChange} />)
        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'gamma' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onChange).toHaveBeenLastCalledWith(['gamma'])
    })

    it('removes the last tag on Backspace when empty', () => {
        const onChange = vi.fn()
        render(<Harness defaultValue={['x', 'y']} onChange={onChange} />)
        const input = screen.getByRole('textbox')
        fireEvent.keyDown(input, { key: 'Backspace' })
        expect(onChange).toHaveBeenLastCalledWith(['x'])
    })

    it('removes a tag via its remove button', () => {
        const onChange = vi.fn()
        render(<Harness defaultValue={['x', 'y']} onChange={onChange} />)
        fireEvent.click(screen.getByRole('button', { name: /remove x/i }))
        expect(onChange).toHaveBeenLastCalledWith(['y'])
    })

    it('rejects invalid tags with a validation message', () => {
        const onChange = vi.fn()
        render(<Harness onChange={onChange} validate={(t) => t.length > 2 || 'too short'} />)
        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'ab' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onChange).not.toHaveBeenCalled()
        expect(screen.getByText('too short')).toBeInTheDocument()
    })

    it('rejects duplicates', () => {
        const onChange = vi.fn()
        render(<Harness defaultValue={['dup']} onChange={onChange} />)
        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'dup' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onChange).not.toHaveBeenCalled()
        expect(screen.getByText(/already added/i)).toBeInTheDocument()
    })
})
