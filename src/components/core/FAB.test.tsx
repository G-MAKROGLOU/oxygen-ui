import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FAB from './FAB'

const Plus = <span>+</span>

describe('FAB', () => {
    it('calls onClick in single mode', () => {
        const onClick = vi.fn()
        render(<FAB icon={Plus} label="New" onClick={onClick} />)
        fireEvent.click(screen.getByRole('button', { name: 'New' }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('toggles the speed dial and exposes actions', () => {
        render(
            <FAB icon={Plus} label="Create" actions={[{ icon: <span>d</span>, label: 'Document' }]} />,
        )
        const main = screen.getByRole('button', { name: 'Create' })
        expect(main).toHaveAttribute('aria-expanded', 'false')
        fireEvent.click(main)
        expect(main).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByRole('button', { name: 'Document' })).toBeInTheDocument()
    })

    it('runs an action and closes the dial', () => {
        const onAction = vi.fn()
        render(
            <FAB icon={Plus} label="Create" actions={[{ icon: <span>d</span>, label: 'Document', onClick: onAction }]} />,
        )
        fireEvent.click(screen.getByRole('button', { name: 'Create' }))
        fireEvent.click(screen.getByRole('button', { name: 'Document' }))
        expect(onAction).toHaveBeenCalledTimes(1)
    })
})
