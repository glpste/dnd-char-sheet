import { newCharacter, newSpell } from '../model/character';
import { migrateCharacter } from './migrate';

describe('migrateCharacter', () => {
  it('rejects shapes that are not characters', () => {
    expect(migrateCharacter({})).toBeNull();
    expect(migrateCharacter(null)).toBeNull();
    expect(migrateCharacter('nope')).toBeNull();
    expect(migrateCharacter({ id: 'x', schemaVersion: 99 })).toBeNull();
  });

  it('passes a valid v1 character through unchanged', () => {
    const c = newCharacter('Thalia');
    expect(migrateCharacter(JSON.parse(JSON.stringify(c)))).toEqual(c);
  });

  it('fills missing optional fields from defaults', () => {
    const c = newCharacter('Thalia') as unknown as Record<string, unknown>;
    delete c['notes'];
    delete c['weapons'];
    const out = migrateCharacter(c);
    expect(out?.notes).toBe('');
    expect(out?.weapons).toEqual([]);
    expect(out?.info.name).toBe('Thalia');
  });

  it('replaces wrong-typed leaves with defaults instead of persisting them', () => {
    const raw = JSON.parse(JSON.stringify(newCharacter('Thalia')));
    raw.info.name = null;
    raw.abilities.str = 'abc';
    raw.combat.hp.current = '12';
    raw.notes = 42;
    const out = migrateCharacter(raw);
    expect(out?.info.name).toBe('');
    expect(out?.abilities.str).toBe(10);
    expect(out?.combat.hp.current).toBe(10);
    expect(out?.notes).toBe('');
  });

  it('repairs malformed weapon and spell lists', () => {
    const raw = JSON.parse(JSON.stringify(newCharacter('Thalia')));
    raw.weapons = 'x';
    raw.spellbook.spells = [{}, 'junk', { id: 's1', name: 'Light', level: 99 }];
    const out = migrateCharacter(raw);
    expect(out?.weapons).toEqual([]);
    expect(out?.spellbook.spells).toHaveLength(2);
    expect(out?.spellbook.spells[0]?.name).toBe('');
    expect(Object.keys(out!.spellbook.spells[0]!).sort()).toEqual(Object.keys(newSpell(0)).sort());
    expect(out?.spellbook.spells[1]?.level).toBe(0);
  });

  it('keeps a weapon with an unknown ability by falling back to str', () => {
    const raw = JSON.parse(JSON.stringify(newCharacter('Thalia')));
    raw.weapons = [{ id: 'w', name: 'Club', ability: 'luck' }];
    expect(migrateCharacter(raw)?.weapons[0]?.ability).toBe('str');
  });

  it('rejects an empty id', () => {
    const raw = JSON.parse(JSON.stringify(newCharacter('Thalia')));
    raw.id = '';
    expect(migrateCharacter(raw)).toBeNull();
  });

  it('fills a missing skill entry', () => {
    const c = newCharacter('Thalia');
    const raw = JSON.parse(JSON.stringify(c));
    delete raw.skills.stealth;
    expect(migrateCharacter(raw)?.skills.stealth).toEqual({ proficiency: 'none' });
  });
});
