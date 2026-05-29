import '@testing-library/jest-dom'

// ── jsdom polyfills ───────────────────────────────────────────────────────────
// jsdom doesn't implement ResizeObserver, which several Radix primitives
// (Slider, Tooltip, etc.) measure with on mount. Provide a no-op shim so those
// components render in tests.
if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    } as unknown as typeof ResizeObserver
}
