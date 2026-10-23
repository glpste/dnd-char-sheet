import { newCharacter, type Character } from '../model/character';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Recursively fill missing keys of `raw` from `defaults` (objects only; arrays and primitives are taken as-is). */
function fill<T>(raw: unknown, defaults: T): T {
  if (!isRecord(defaults) || Array.isArray(defaults)) {
    return (raw === undefined ? defaults : raw) as T;
  }
  const src = isRecord(raw) ? raw : {};
  const out: Record<string, unknown> = { ...src };
  for (const [k, d] of Object.entries(defaults)) {
    out[k] = fill(src[k], d);
  }
  return out as T;
}

/**
 * Validate and upgrade a stored character. Returns null when the value is not a
 * character at all. Missing fields are filled from a fresh character so older or
 * hand-edited records still load.
 */
export function migrateCharacter(raw: unknown): Character | null {
  if (!isRecord(raw)) return null;
  if (typeof raw['id'] !== 'string' || !isRecord(raw['info'])) return null;
  if (raw['schemaVersion'] !== undefined && raw['schemaVersion'] !== 1) return null;
  const defaults = newCharacter();
  const filled = fill(raw, defaults);
  filled.schemaVersion = 1;
  return filled;
}
