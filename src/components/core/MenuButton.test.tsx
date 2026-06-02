import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import MenuButton from './MenuButton'

describe('MenuButton', () => {
    it('renders a menu trigger with the label', () => {
        render(<MenuButton label="Actions" items={[{ key: 'a', label: 'Edit' }]} />)
        const trigger = screen.getByRole('button', { name: /Actions/ })
        expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    })

    it('opens the menu and fires onSelect', async () => {
        const onSelect = vi.fn()
        const user = userEvent.setup()
        render(
            <MenuButton
                label="Actions"
                items={[
                    { key: 'edit', label: 'Edit', onSelect },
                    { key: 'del', label: 'Delete', danger: true },
                ]}
            />,
        )
        await user.click(screen.getByRole('button', { name: /Actions/ }))
        const edit = await screen.findByRole('menuitem', { name: 'Edit' })
        expect(edit).toBeInTheDocument()
        await user.click(edit)
        expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('does not fire onSelect for a disabled item', async () => {
        const onSelect = vi.fn()
        const user = userEvent.setup()
        render(<MenuButton label="Menu" items={[{ key: 'x', label: 'Nope', disabled: true, onSelect }]} />)
        await user.click(screen.getByRole('button', { name: /Menu/ }))
        const item = await screen.findByRole('menuitem', { name: 'Nope' })
        await user.click(item)
        expect(onSelect).not.toHaveBeenCalled()
    })
})
