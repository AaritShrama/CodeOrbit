/**
 * Minimal stand-ins for the browser APIs that CodeOrbit's core modules touch
 * when they are imported (storage.js creates its singleton immediately).
 * Loaded with `node --import` before any test file, so app code sees them.
 */

class MemoryStorage {
  constructor() {
    this.map = new Map();
    this.failGet = false; // simulate blocked localStorage (some private modes)
  }
  getItem(key) {
    if (this.failGet) throw new Error('SecurityError: localStorage is not available');
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(key, String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
}

globalThis.localStorage = new MemoryStorage();

// window: only events are needed (storage dispatches 'codeorbit:data-changed').
if (typeof globalThis.window === 'undefined') {
  const target = new EventTarget();
  globalThis.window = {
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target)
  };
}

if (typeof globalThis.CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this.detail = options.detail ?? null;
    }
  };
}
