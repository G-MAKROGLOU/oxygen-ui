import React, { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Tabs from './Tabs'

function Basic() {
    return (
        <Tabs defaultValue="a">
            <Tabs.List aria-label="Sections">
                <Tabs.Trigger value="a">Alpha</Tabs.Trigger>
                <Tabs.Trigger value="b">Beta</Tabs.Trigger>
                <Tabs.Trigger value="c" disabled>Gamma</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Panel value="a"><p>Alpha panel</p></Tabs.Panel>
            <Tabs.Panel value="b"><p>Beta panel</p></Tabs.Panel>
            <Tabs.Panel value="c"><p>Gamma panel</p></Tabs.Panel>
        </Tabs>
    )
}

describe('Tabs', () => {
    it('renders the default panel and lazily omits the others', () => {
        render(<Basic />)
        expect(screen.getByText('Alpha panel')).toBeInTheDocument()
        expect(screen.queryByText('Beta panel')).not.toBeInTheDocument()
    })

    it('switches panels when a tab is activated', () => {
        render(<Basic />)
        // Radix Tabs use automatic activation — focusing the tab selects it.
        const beta = screen.getByRole('tab', { name: 'Beta' })
        beta.focus()
        fireEvent.focus(beta)
        expect(screen.getByText('Beta panel')).toBeInTheDocument()
        expect(screen.queryByText('Alpha panel')).not.toBeInTheDocument()
    })

    it('marks the active tab via aria-selected', () => {
        render(<Basic />)
        expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'false')
    })

    it('disables a disabled trigger', () => {
        render(<Basic />)
        expect(screen.getByRole('tab', { name: 'Gamma' })).toBeDisabled()
    })

    it('fires onClose from a closeable tab and onClick from add', () => {
        const onClose = vi.fn()
        const onAdd = vi.fn()
        function Dyn() {
            const [v, setV] = useState('x')
            return (
                <Tabs value={v} onValueChange={setV}>
                    <Tabs.List aria-label="t">
                        <Tabs.Trigger value="x" closeable onClose={onClose}>One</Tabs.Trigger>
                        <Tabs.Add onClick={onAdd} />
                    </Tabs.List>
                    <Tabs.Panel value="x"><p>One panel</p></Tabs.Panel>
                </Tabs>
            )
        }
        render(<Dyn />)
        fireEvent.click(screen.getByRole('button', { name: 'Close tab' }))
        expect(onClose).toHaveBeenCalledTimes(1)
        fireEvent.click(screen.getByRole('button', { name: 'Add tab' }))
        expect(onAdd).toHaveBeenCalledTimes(1)
    })

    it('keeps inactive panels mounted with keepMounted', () => {
        render(
            <Tabs defaultValue="a">
                <Tabs.List aria-label="k">
                    <Tabs.Trigger value="a">A</Tabs.Trigger>
                    <Tabs.Trigger value="b">B</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Panel value="a" keepMounted><p>A body</p></Tabs.Panel>
                <Tabs.Panel value="b" keepMounted><p>B body</p></Tabs.Panel>
            </Tabs>,
        )
        // Both mounted; the inactive one is hidden (present in DOM).
        expect(screen.getByText('A body')).toBeInTheDocument()
        expect(screen.getByText('B body')).toBeInTheDocument()
    })
})
