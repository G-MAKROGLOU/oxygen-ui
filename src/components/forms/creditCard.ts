/**
 * Zero-dependency credit-card helpers: brand detection, Luhn checksum, and
 * display formatting. Pure functions — no React, no deps — so they're unit
 * testable and reusable.
 */

export interface CardBrand {
    /** Stable id, e.g. `'visa'`. */
    id: string
    /** Human label, e.g. `'Visa'`. */
    label: string
    /** Short badge text, e.g. `'VISA'`. */
    short: string
    /** Accent colour for the brand badge (hex). */
    color: string
    /** Matches the leading digits of the card number. */
    pattern: RegExp
    /** Valid total digit lengths for this brand. */
    lengths: number[]
    /** Expected CVV length (3 for most, 4 for Amex). */
    cvv: number
    /** Zero-based digit indices to insert a space before (grouping). */
    gaps: number[]
}

/** Recognised brands, in match-priority order. */
export const CARD_BRANDS: CardBrand[] = [
    { id: 'amex', label: 'American Express', short: 'AMEX', color: '#1F72CD', pattern: /^3[47]/, lengths: [15], cvv: 4, gaps: [4, 10] },
    { id: 'visa', label: 'Visa', short: 'VISA', color: '#1A1F71', pattern: /^4/, lengths: [16, 18, 19], cvv: 3, gaps: [4, 8, 12, 16] },
    { id: 'mastercard', label: 'Mastercard', short: 'MC', color: '#EB001B', pattern: /^(5[1-5]|2[2-7])/, lengths: [16], cvv: 3, gaps: [4, 8, 12] },
    { id: 'discover', label: 'Discover', short: 'DISC', color: '#FF6000', pattern: /^(6011|64[4-9]|65)/, lengths: [16, 19], cvv: 3, gaps: [4, 8, 12] },
    { id: 'diners', label: 'Diners Club', short: 'DINERS', color: '#0079BE', pattern: /^(36|38|30[0-5])/, lengths: [14, 16, 19], cvv: 3, gaps: [4, 10] },
    { id: 'jcb', label: 'JCB', short: 'JCB', color: '#0B4EA2', pattern: /^35/, lengths: [16, 17, 18, 19], cvv: 3, gaps: [4, 8, 12] },
]

/** Strip everything but digits. */
export const onlyDigits = (s: string): string => (s || '').replace(/\D/g, '')

/** Detect the card brand from a (possibly partial) number. `null` if unknown. */
export function detectBrand(value: string): CardBrand | null {
    const d = onlyDigits(value)
    if (!d) return null
    return CARD_BRANDS.find((b) => b.pattern.test(d)) ?? null
}

/** Max digit length to accept for a value (longest length of its brand, else 19). */
export function maxCardLength(value: string): number {
    const b = detectBrand(value)
    return b ? Math.max(...b.lengths) : 19
}

/** Luhn (mod-10) checksum — the standard card-number integrity check. */
export function luhnValid(value: string): boolean {
    const s = onlyDigits(value)
    if (s.length < 12) return false
    let sum = 0
    let double = false
    for (let i = s.length - 1; i >= 0; i--) {
        let n = s.charCodeAt(i) - 48
        if (double) { n *= 2; if (n > 9) n -= 9 }
        sum += n
        double = !double
    }
    return sum % 10 === 0
}

/** Format a card number with brand-aware grouping (e.g. `4242 4242 4242 4242`). */
export function formatCardNumber(value: string): string {
    const brand = detectBrand(value)
    const digits = onlyDigits(value).slice(0, maxCardLength(value))
    const gaps = brand?.gaps ?? [4, 8, 12, 16]
    let out = ''
    for (let i = 0; i < digits.length; i++) {
        if (gaps.includes(i)) out += ' '
        out += digits[i]
    }
    return out
}

/** Validate a card number: known brand, complete length, passing Luhn. */
export function cardNumberError(value: string): string | undefined {
    const d = onlyDigits(value)
    if (!d) return 'Card number is required'
    const brand = detectBrand(d)
    if (!brand) return 'Unsupported card type'
    if (!brand.lengths.includes(d.length)) return 'Card number is incomplete'
    if (!luhnValid(d)) return 'Card number looks invalid'
    return undefined
}

/** Format expiry keystrokes into `MM/YY`, auto-padding the month and slashing. */
export function formatExpiry(value: string): string {
    let d = onlyDigits(value).slice(0, 4)
    // Auto-pad a single month digit > 1 (e.g. "5" → "05").
    if (d.length === 1 && d > '1') d = '0' + d
    if (d.length <= 2) return d
    return `${d.slice(0, 2)}/${d.slice(2)}`
}

/** Validate `MM/YY`: well-formed, real month, not in the past. */
export function expiryError(value: string, now: Date = new Date()): string | undefined {
    if (!value) return 'Expiry is required'
    const m = value.match(/^(\d{2})\/(\d{2})$/)
    if (!m) return 'Use MM/YY'
    const mm = Number(m[1])
    const yy = Number(m[2])
    if (mm < 1 || mm > 12) return 'Invalid month'
    // Card is valid through the last day of its expiry month.
    const endOfMonth = new Date(2000 + yy, mm, 0, 23, 59, 59, 999)
    if (endOfMonth < now) return 'Card has expired'
    return undefined
}

/** Validate the CVV against the detected brand's expected length. */
export function cvvError(value: string, cardNumber: string): string | undefined {
    const need = detectBrand(cardNumber)?.cvv ?? 3
    const d = onlyDigits(value)
    if (!d) return 'CVV is required'
    if (d.length !== need) return `CVV must be ${need} digits`
    return undefined
}
