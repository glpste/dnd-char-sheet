import { newCharacter, newSpell, newWeapon, type Character } from '../model/character';
import { characterReducer } from './characterReducer';

function base(): Character {
  const c = newCharacter('T');
  c.combat.hp = { max: 30, current: 20, temp: 5 };
  return c;
}

describe('characterReducer hp', () => {
  it('negative delta consumes temp hp first', () => {
    const c = characterReducer(base(), { type: 'hp', delta: -7 });
    expect(c.combat.hp).toEqual({ max: 30, current: 18, temp: 0 });
  });
  it('positive delta clamps to max', () => {
    const c = characterReducer(base(), { type: 'hp', delta: 100 });
    expect(c.combat.hp.current).toBe(30);
  });
  it('never drops current below zero', () => {
    const c = characterReducer(base(), { type: 'hp', delta: -100 });
    expect(c.combat.hp).toEqual({ max: 30, current: 0, temp: 0 });
  });
  it('lowering max clamps current', () => {
    const c = characterReducer(base(), { type: 'patch', patch: { combat: { hp: { max: 5 } } } });
    expect(c.combat.hp.current).toBe(5);
  });
  it('bumps updatedAt', () => {
    const b = base();
    b.updatedAt = '2000-01-01T00:00:00.000Z';
    expect(characterReducer(b, { type: 'hp', delta: -1 }).updatedAt).not.toBe(b.updatedAt);
  });
});

describe('characterReducer patch', () => {
  it('deep-merges nested objects without touching siblings', () => {
    const c = characterReducer(base(), { type: 'patch', patch: { info: { race: 'Elf' } } });
    expect(c.info.race).toBe('Elf');
    expect(c.info.name).toBe('T');
    expect(c.abilities.str).toBe(10);
  });
  it('clamps ability scores', () => {
    const c = characterReducer(base(), { type: 'patch', patch: { abilities: { str: 99 } } });
    expect(c.abilities.str).toBe(30);
  });
});

describe('characterReducer weapons', () => {
  it('adds, updates, moves and removes', () => {
    let c = characterReducer(base(), { type: 'weapon/add' });
    c = characterReducer(c, { type: 'weapon/add' });
    const [a, b] = c.weapons;
    expect(c.weapons).toHaveLength(2);
    c = characterReducer(c, { type: 'weapon/update', id: a!.id, patch: { name: 'Bow' } });
    expect(c.weapons[0]?.name).toBe('Bow');
    c = characterReducer(c, { type: 'weapon/move', id: a!.id, dir: -1 });
    expect(c.weapons[0]?.id).toBe(a!.id);
    c = characterReducer(c, { type: 'weapon/move', id: a!.id, dir: 1 });
    expect(c.weapons.map((w) => w.id)).toEqual([b!.id, a!.id]);
    c = characterReducer(c, { type: 'weapon/remove', id: a!.id });
    expect(c.weapons.map((w) => w.id)).toEqual([b!.id]);
  });
  it('restores a removed weapon at its index', () => {
    const w = { ...newWeapon(), name: 'Back' };
    const c = characterReducer(base(), { type: 'weapon/restore', weapon: w, index: 0 });
    expect(c.weapons[0]?.name).toBe('Back');
  });
});

describe('characterReducer spells and slots', () => {
  it('adds a spell at the given level and restores removed ones', () => {
    let c = characterReducer(base(), { type: 'spell/add', level: 2 });
    expect(c.spellbook.spells[0]?.level).toBe(2);
    const s = { ...newSpell(0), name: 'Light' };
    c = characterReducer(c, { type: 'spell/restore', spell: s, index: 0 });
    expect(c.spellbook.spells[0]?.name).toBe('Light');
    c = characterReducer(c, { type: 'spell/remove', id: s.id });
    expect(c.spellbook.spells.find((x) => x.id === s.id)).toBeUndefined();
  });
  it('moves a spell relative to its neighbours within the same level', () => {
    let c = base();
    const l1a = { ...newSpell(1), name: 'A1' };
    const l0 = { ...newSpell(0), name: 'C0' };
    const l1b = { ...newSpell(1), name: 'B1' };
    c.spellbook.spells = [l1a, l0, l1b];
    c = characterReducer(c, { type: 'spell/move', id: l1b.id, dir: -1 });
    // B1 jumps over the cantrip to sit before A1; the cantrip is untouched.
    expect(c.spellbook.spells.map((s) => s.name)).toEqual(['B1', 'C0', 'A1']);
    c = characterReducer(c, { type: 'spell/move', id: l0.id, dir: -1 });
    expect(c.spellbook.spells.map((s) => s.name)).toEqual(['B1', 'C0', 'A1']);
  });

  it('toggles slot pips to the clicked index', () => {
    let c = base();
    c.spellbook.slots[1] = { total: 4, used: 1 };
    c = characterReducer(c, { type: 'slots/toggle', level: 1, index: 2 });
    expect(c.spellbook.slots[1].used).toBe(3);
    c = characterReducer(c, { type: 'slots/toggle', level: 1, index: 2 });
    expect(c.spellbook.slots[1].used).toBe(2);
  });
  it('long rest zeroes used slots', () => {
    let c = base();
    c.spellbook.slots[1] = { total: 4, used: 3 };
    c.spellbook.slots[3] = { total: 2, used: 2 };
    c = characterReducer(c, { type: 'slots/longRest' });
    expect(c.spellbook.slots[1].used).toBe(0);
    expect(c.spellbook.slots[3].used).toBe(0);
  });
});
