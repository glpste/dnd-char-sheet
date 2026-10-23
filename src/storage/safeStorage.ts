/** Minimal in-memory Storage for browsers where localStorage is unavailable (privacy modes, sandboxed frames). */
export function memoryStorage(): Storage {
  const map = new Map<string, string>();
  const s: Storage = {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => {
      map.delete(k);
    },
    setItem: (k, v) => {
      map.set(k, String(v));
    },
  };
  return s;
}

/** window.localStorage if it can be read and written, else a session-only fallback. */
export function getStorage(): Storage {
  try {
    const s = window.localStorage;
    const probe = '__dnd-sheet-probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    console.warn('dnd-sheet: localStorage unavailable, falling back to in-memory storage for this session');
    return memoryStorage();
  }
}
