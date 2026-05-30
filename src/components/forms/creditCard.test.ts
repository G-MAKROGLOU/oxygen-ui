import { describe, it, expect } from 'vitest'
import {
    detectBrand,
    luhnValid,
    formatCardNumber,
    formatExpiry,
    cardNumberError,
    expiryError,
    cvvError,
} from './creditCard'

describe('creditCard utils', () => {
    it('detects brands from the prefix', () => {
        expect(detectBrand('4242424242424242')?.id).toBe('visa')
        expect(detectBrand('378282246310005')?.id).toBe('amex')
        expect(detectBrand('5555555555554444')?.id).toBe('mastercard')
        expect(detectBrand('6011000990139424')?.id).toBe('discover')
        expect(detectBrand('1234')).toBeNull()
    })

    it('validates with the Luhn checksum', () => {
        expect(luhnValid('4242424242424242')).toBe(true)
        expect(luhnValid('4242 4242 4242 4242')).toBe(true) // spaces tolerated
        expect(luhnValid('4242424242424241')).toBe(false)
    })

    it('formats numbers with brand-aware grouping', () => {
        expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
        expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005') // amex 4-6-5
    })

    it('reports card-number errors', () => {
        expect(cardNumberError('')).toMatch(/required/i)
        expect(cardNumberError('1234')).toMatch(/unsupported/i)
        expect(cardNumberError('4242 4242 4242')).toMatch(/incomplete/i)
        expect(cardNumberError('4242 4242 4242 4241')).toMatch(/invalid/i)
        expect(cardNumberError('4242 4242 4242 4242')).toBeUndefined()
    })

    it('formats + validates expiry', () => {
        expect(formatExpiry('5')).toBe('05')      // auto-pad month
        expect(formatExpiry('1226')).toBe('12/26') // auto-slash
        expect(expiryError('13/30')).toMatch(/month/i)
        expect(expiryError('01/20', new Date('2026-05-30'))).toMatch(/expired/i)
        expect(expiryError('12/40', new Date('2026-05-30'))).toBeUndefined()
    })

    it('validates CVV length per brand', () => {
        expect(cvvError('12', '4242424242424242')).toMatch(/3 digits/)
        expect(cvvError('123', '4242424242424242')).toBeUndefined()
        expect(cvvError('123', '378282246310005')).toMatch(/4 digits/) // amex needs 4
        expect(cvvError('1234', '378282246310005')).toBeUndefined()
    })
})
