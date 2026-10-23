import { getStorage, memoryStorage } from './safeStorage';

describe('safeStorage', () => {
  it('returns localStorage when it is usable', () => {
    expect(getStorage()).toBe(window.localStorage);
  });

  it('falls back to in-memory storage when localStorage throws', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });
    try {
      const s = getStorage();
      s.setItem('a', '1');
      expect(s.getItem('a')).toBe('1');
      expect(s).not.toBe(original.value);
    } finally {
      Object.defineProperty(window, 'localStorage', original);
    }
  });

  it('memoryStorage implements the Storage surface we use', () => {
    const s = memoryStorage();
    s.setItem('k', 'v');
    expect(s.getItem('k')).toBe('v');
    expect(s.length).toBe(1);
    expect(s.key(0)).toBe('k');
    s.removeItem('k');
    expect(s.getItem('k')).toBeNull();
  });
});
