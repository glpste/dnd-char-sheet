import {
  ABILITIES,
  newCharacter,
  newSpell,
  newWeapon,
  SPELL_LEVELS,
  type Character,
  type Spell,
  type SpellLevel,
  type Weapon,
  type WeaponAbility,
} from '../model/character';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Recursively fill `raw` from `defaults`, keeping a raw leaf only when its type
 * matches the default's. Arrays are handled by the caller (they need per-item defaults).
 */
function fill<T>(raw: unknown, defaults: T): T {
  if (isRecord(defaults)) {
    const src = isRecord(raw) ? raw : {};
    const out: Record<string, unknown> = { ...src };
    for (const [k, d] of Object.entries(defaults)) {
      out[k] = fill(src[k], d);
    }
    return out as T;
  }
  if (Array.isArray(defaults)) {
    return (Array.isArray(raw) ? raw : defaults) as T;
  }
  if (defaults === null) {
    return (raw === null || typeof raw === 'string' ? raw : null) as T;
  }
  if (typeof raw !== typeof defaults) return defaults;
  if (typeof raw === 'number' && !Number.isFinite(raw)) return defaults;
  return raw as T;
}

const WEAPON_ABILITIES: readonly WeaponAbility[] = [...ABILITIES, 'finesse', 'none'];

function fillWeapon(raw: unknown): Weapon | null {
  if (!isRecord(raw)) return null;
  const w = fill(raw, newWeapon());
  if (!WEAPON_ABILITIES.includes(w.ability)) w.ability = 'str';
  if (!w.id) w.id = newWeapon().id;
  return w;
}

function fillSpell(raw: unknown): Spell | null {
  if (!isRecord(raw)) return null;
  const s = fill(raw, newSpell(0));
  if (!(SPELL_LEVELS as readonly number[]).includes(s.level)) s.level = 0 as SpellLevel;
  if (!s.id) s.id = newSpell(0).id;
  return s;
}

/**
 * Validate and upgrade a stored character. Returns null when the value is not a
 * character at all. Wrong-typed or missing fields are replaced from a fresh
 * character so a hand-edited or foreign record can never crash the app on load.
 */
export function migrateCharacter(raw: unknown): Character | null {
  if (!isRecord(raw)) return null;
  if (typeof raw['id'] !== 'string' || raw['id'] === '' || !isRecord(raw['info'])) return null;
  if (raw['schemaVersion'] !== undefined && raw['schemaVersion'] !== 1) return null;
  // Empty name rather than "New character": we never invent a name for a record we did not create.
  const defaults = newCharacter('');
  const filled = fill(raw, defaults);
  filled.schemaVersion = 1;
  filled.weapons = filled.weapons.map(fillWeapon).filter((w): w is Weapon => w !== null);
  filled.spellbook.spells = filled.spellbook.spells.map(fillSpell).filter((s): s is Spell => s !== null);
  if (filled.spellbook.ability !== null && !(ABILITIES as readonly string[]).includes(filled.spellbook.ability)) {
    filled.spellbook.ability = null;
  }
  return filled;
}
