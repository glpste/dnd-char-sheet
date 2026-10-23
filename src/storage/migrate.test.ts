import { newCharacter } from '../model/character';
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

  it('fills a missing skill entry', () => {
    const c = newCharacter('Thalia');
    const raw = JSON.parse(JSON.stringify(c));
    delete raw.skills.stealth;
    expect(migrateCharacter(raw)?.skills.stealth).toEqual({ proficiency: 'none' });
  });
});
