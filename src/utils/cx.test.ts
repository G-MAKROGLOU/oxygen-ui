import { describe, it, expect } from 'vitest'
import { cx } from './cx'

describe('cx', () => {
    it('joins truthy class names with single spaces', () => {
        expect(cx('a', 'b', 'c')).toBe('a b c')
    })

    it('drops falsy values (false, null, undefined, 0, empty string)', () => {
        expect(cx('a', false, null, undefined, '', 0, 'b')).toBe('a b')
    })

    it('supports conditional expressions', () => {
        const active = true
        const disabled = false
        expect(cx('btn', active && 'is-active', disabled ? 'is-disabled' : null)).toBe('btn is-active')
    })

    it('returns an empty string when everything is falsy', () => {
        expect(cx(false, null, undefined)).toBe('')
    })
})
