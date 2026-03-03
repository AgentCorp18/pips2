import '@testing-library/jest-dom/vitest'

// Polyfill ResizeObserver for jsdom (needed by cmdk and other Radix-based components)
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
