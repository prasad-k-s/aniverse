import '@testing-library/jest-dom'

// Route handler tests run in the "node" environment, where there is no window
const isBrowser = typeof window !== 'undefined'

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (isBrowser) {
  // jsdom doesn't implement these browser APIs used by Radix UI and our infinite scroll
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: IntersectionObserverMock,
  })
  Object.defineProperty(window, 'ResizeObserver', { writable: true, value: ResizeObserverMock })
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })

  // Radix pointer-capture helpers missing in jsdom
  window.HTMLElement.prototype.hasPointerCapture = () => false
  window.HTMLElement.prototype.releasePointerCapture = () => {}
  window.HTMLElement.prototype.scrollIntoView = () => {}
}

afterEach(() => {
  if (isBrowser) localStorage.clear()
})
