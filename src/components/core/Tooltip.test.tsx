import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Tooltip, { TooltipProvider } from './Tooltip'

describe('Tooltip', () => {
    it('renders the trigger child untouched', () => {
        render(
            <TooltipProvider>
                <Tooltip title="Hello"><button>open</button></Tooltip>
            </TooltipProvider>
        )
        // The trigger renders; Radix internals (ResizeObserver, positioning)
        // require a full layout environment that jsdom doesn't provide, so we
        // don't exercise the open-on-hover branch here.
        expect(screen.getByRole('button', { name: 'open' })).toBeInTheDocument()
    })
})
