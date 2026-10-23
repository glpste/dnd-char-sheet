import {
  newSpell,
  newWeapon,
  type Character,
  type SlotLevel,
  type Spell,
  type SpellLevel,
  type Weapon,
} from '../model/character';
import { clampScore } from '../rules/derive';

export type DeepPartial<T> = T extends (infer U)[]
  ? U[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export type Action =
  | { type: 'patch'; patch: DeepPartial<Character> }
  | { type: 'hp'; delta: number }
  | { type: 'weapon/add' }
  | { type: 'weapon/update'; id: string; patch: Partial<Weapon> }
  | { type: 'weapon/remove'; id: string }
  | { type: 'weapon/restore'; weapon: Weapon; index: number }
  | { type: 'weapon/move'; id: string; dir: -1 | 1 }
  | { type: 'spell/add'; level: SpellLevel }
  | { type: 'spell/update'; id: string; patch: Partial<Spell> }
  | { type: 'spell/remove'; id: string }
  | { type: 'spell/restore'; spell: Spell; index: number }
  | { type: 'spell/move'; id: string; dir: -1 | 1 }
  | { type: 'slots/toggle'; level: SlotLevel; index: number }
  | { type: 'slots/longRest' };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function deepMerge<T>(target: T, patch: DeepPartial<T>): T {
  if (!isPlainObject(target) || !isPlainObject(patch)) return patch as T;
  const out: Record<string, unknown> = { ...target };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) {
      delete out[k];
    } else {
      out[k] = deepMerge(target[k], v as DeepPartial<unknown>);
    }
  }
  return out as T;
}

function clampInt(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/** Enforce invariants that any edit path must respect. */
function normalize(c: Character): Character {
  const abilities = { ...c.abilities };
  for (const k of Object.keys(abilities) as (keyof typeof abilities)[]) {
    abilities[k] = clampScore(abilities[k]);
  }
  const max = Math.max(0, Math.trunc(c.combat.hp.max) || 0);
  const hp = {
    max,
    current: clampInt(c.combat.hp.current, 0, max),
    temp: Math.max(0, Math.trunc(c.combat.hp.temp) || 0),
  };
  const level = clampInt(c.info.level, 1, 20);
  return { ...c, abilities, info: { ...c.info, level }, combat: { ...c.combat, hp } };
}

/**
 * Swap `id` with its nearest neighbour in `dir` among items that satisfy `sameGroup`.
 * Items outside the group (e.g. spells of other levels) keep their positions.
 */
function move<T extends { id: string }>(
  list: T[],
  id: string,
  dir: -1 | 1,
  sameGroup: (a: T, b: T) => boolean = () => true,
): T[] {
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return list;
  const me = list[i]!;
  let j = i + dir;
  while (j >= 0 && j < list.length && !sameGroup(me, list[j]!)) j += dir;
  if (j < 0 || j >= list.length) return list;
  const out = [...list];
  out[i] = list[j]!;
  out[j] = me;
  return out;
}

function insertAt<T>(list: T[], item: T, index: number): T[] {
  const out = [...list];
  out.splice(clampInt(index, 0, list.length), 0, item);
  return out;
}

function apply(c: Character, a: Action): Character {
  switch (a.type) {
    case 'patch':
      return deepMerge(c, a.patch);
    case 'hp': {
      let { current, temp } = c.combat.hp;
      if (a.delta < 0) {
        const fromTemp = Math.min(temp, -a.delta);
        temp -= fromTemp;
        current += a.delta + fromTemp;
      } else {
        current += a.delta;
      }
      return { ...c, combat: { ...c.combat, hp: { ...c.combat.hp, current, temp } } };
    }
    case 'weapon/add':
      return { ...c, weapons: [...c.weapons, newWeapon()] };
    case 'weapon/update':
      return { ...c, weapons: c.weapons.map((w) => (w.id === a.id ? { ...w, ...a.patch } : w)) };
    case 'weapon/remove':
      return { ...c, weapons: c.weapons.filter((w) => w.id !== a.id) };
    case 'weapon/restore':
      return { ...c, weapons: insertAt(c.weapons, a.weapon, a.index) };
    case 'weapon/move':
      return { ...c, weapons: move(c.weapons, a.id, a.dir) };
    case 'spell/add':
      return { ...c, spellbook: { ...c.spellbook, spells: [...c.spellbook.spells, newSpell(a.level)] } };
    case 'spell/update':
      return {
        ...c,
        spellbook: {
          ...c.spellbook,
          spells: c.spellbook.spells.map((s) => (s.id === a.id ? { ...s, ...a.patch } : s)),
        },
      };
    case 'spell/remove':
      return { ...c, spellbook: { ...c.spellbook, spells: c.spellbook.spells.filter((s) => s.id !== a.id) } };
    case 'spell/restore':
      return { ...c, spellbook: { ...c.spellbook, spells: insertAt(c.spellbook.spells, a.spell, a.index) } };
    case 'spell/move':
      return {
        ...c,
        spellbook: { ...c.spellbook, spells: move(c.spellbook.spells, a.id, a.dir, (x, y) => x.level === y.level) },
      };
    case 'slots/toggle': {
      const slot = c.spellbook.slots[a.level];
      // Clicking pip i (0-based): if it is already used, un-use it and everything after; else use up to and including it.
      const used = a.index < slot.used ? a.index : a.index + 1;
      return {
        ...c,
        spellbook: { ...c.spellbook, slots: { ...c.spellbook.slots, [a.level]: { ...slot, used: clampInt(used, 0, slot.total) } } },
      };
    }
    case 'slots/longRest': {
      const slots = { ...c.spellbook.slots };
      for (const k of Object.keys(slots) as unknown as SlotLevel[]) {
        slots[k] = { ...slots[k], used: 0 };
      }
      return { ...c, spellbook: { ...c.spellbook, slots } };
    }
  }
}

export function characterReducer(c: Character, a: Action): Character {
  const next = normalize(apply(c, a));
  return { ...next, updatedAt: new Date().toISOString() };
}
