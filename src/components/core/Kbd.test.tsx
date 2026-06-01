import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Kbd from './Kbd'

describe('Kbd', () => {
    it('renders a single key', () => {
        render(<Kbd>Esc</Kbd>)
        expect(screen.getByText('Esc').tagName).toBe('KBD')
    })

    it('renders each key of a combo as its own cap', () => {
        render(<Kbd keys={['Ctrl', 'K']} />)
        expect(screen.getByText('Ctrl').tagName).toBe('KBD')
        expect(screen.getByText('K').tagName).toBe('KBD')
    })
})
