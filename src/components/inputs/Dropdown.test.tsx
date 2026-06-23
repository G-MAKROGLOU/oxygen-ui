import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import Dropdown from './Dropdown'
import Modal from '../core/Modal'

const ITEMS = [
    { key: 1, label: 'Aurora'  },
    { key: 2, label: 'Beacon'  },
    { key: 3, label: 'Catalina' },
]

function Controlled({ onChange }: { onChange?: (v: unknown) => void }) {
    const [v, setV] = useState<unknown>(undefined)
    return (
        <Dropdown
            label="Vessel"
            htmlFor="v"
            items={ITEMS}
            value={v as 1 | 2 | 3 | undefined}
            onChange={(e) => { setV(e.target.value); onChange?.(e.target.value) }}
        />
    )
}

describe('Dropdown', () => {
    it('opens on click and renders items', () => {
        render(<Controlled />)
        fireEvent.click(screen.getByRole('combobox'))
        expect(screen.getByText('Aurora')).toBeInTheDocument()
        expect(screen.getByText('Beacon')).toBeInTheDocument()
    })

    it('selects an item and reports it via onChange', () => {
        const fn = vi.fn()
        render(<Controlled onChange={fn} />)
        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.click(screen.getByText('Beacon'))
        expect(fn).toHaveBeenCalledWith(2)
    })

    it('opens on ArrowDown for keyboard users', () => {
        render(<Controlled />)
        const trigger = screen.getByRole('combobox')
        trigger.focus()
        fireEvent.keyDown(trigger, { key: 'ArrowDown' })
        expect(screen.getByText('Aurora')).toBeInTheDocument()
    })

    it('portals its menu to document.body when used standalone (unchanged behavior)', () => {
        render(<Controlled />)
        fireEvent.click(screen.getByRole('combobox'))
        const list = screen.getByRole('listbox')
        expect(list).toBeInTheDocument()
        // No modal dialog around it: the only labelled dialog (a Modal) is absent.
        expect(screen.queryByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument()
    })

    it('portals its menu INTO the dialog content when nested in a Modal (so the list is inside the scroll-lock)', () => {
        render(
            <Modal open hasFooter={false} title="Filters">
                <Dropdown label="Vessel" htmlFor="v" hasSearch={false} items={ITEMS} />
            </Modal>,
        )
        fireEvent.click(screen.getByRole('combobox'))
        // Select the modal panel by its title (the popover is also role=dialog).
        const modal = screen.getByRole('dialog', { name: 'Filters' })
        // The options list is rendered within the modal content, not document.body.
        expect(within(modal).getByRole('listbox')).toBeInTheDocument()
        expect(within(modal).getByText('Aurora')).toBeInTheDocument()
    })
})
