import React from 'react'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import LogoutTimer from './LogoutTimer'

describe('LogoutTimer', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => {
        vi.runOnlyPendingTimers()
        vi.useRealTimers()
    })

    it('shows the warning after the idle timeout', () => {
        render(<LogoutTimer timeout={3000} countdown={10000} onLogout={() => {}} />)
        expect(screen.queryByText('Still there?')).toBeNull()
        act(() => { vi.advanceTimersByTime(3000) })
        expect(screen.getByText('Still there?')).toBeInTheDocument()
    })

    it('calls onLogout when the countdown elapses', () => {
        const onLogout = vi.fn()
        render(<LogoutTimer timeout={3000} countdown={5000} onLogout={onLogout} />)
        act(() => { vi.advanceTimersByTime(3000) })
        expect(onLogout).not.toHaveBeenCalled()
        act(() => { vi.advanceTimersByTime(5100) })
        expect(onLogout).toHaveBeenCalledTimes(1)
    })

    it('extends the session and hides the warning on "Stay signed in"', () => {
        const onContinue = vi.fn()
        const onLogout = vi.fn()
        render(<LogoutTimer timeout={3000} countdown={5000} onContinue={onContinue} onLogout={onLogout} />)
        act(() => { vi.advanceTimersByTime(3000) })
        fireEvent.click(screen.getByRole('button', { name: 'Stay signed in' }))
        expect(onContinue).toHaveBeenCalledTimes(1)
        expect(onLogout).not.toHaveBeenCalled()
    })

    it('signs out immediately on "Sign out now"', () => {
        const onLogout = vi.fn()
        render(<LogoutTimer timeout={3000} countdown={5000} onLogout={onLogout} />)
        act(() => { vi.advanceTimersByTime(3000) })
        fireEvent.click(screen.getByRole('button', { name: 'Sign out now' }))
        expect(onLogout).toHaveBeenCalledTimes(1)
    })

    it('does nothing while disabled', () => {
        const onLogout = vi.fn()
        render(<LogoutTimer timeout={3000} countdown={5000} enabled={false} onLogout={onLogout} />)
        act(() => { vi.advanceTimersByTime(20000) })
        expect(screen.queryByText('Still there?')).toBeNull()
        expect(onLogout).not.toHaveBeenCalled()
    })
})
