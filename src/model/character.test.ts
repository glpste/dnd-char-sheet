import { newCharacter } from './character';
import { SKILLS } from './skills';

describe('newCharacter', () => {
  it('starts with a complete, empty v1 shape', () => {
    const c = newCharacter('X');
    expect(c.schemaVersion).toBe(1);
    expect(c.info.name).toBe('X');
    expect(Object.keys(c.skills)).toHaveLength(18);
    expect(Object.values(c.skills).every((s) => s.proficiency === 'none')).toBe(true);
    expect(Object.values(c.saves).every((s) => !s.proficient)).toBe(true);
    expect(Object.keys(c.spellbook.slots)).toHaveLength(9);
    expect(Object.values(c.spellbook.slots).every((s) => s.total === 0 && s.used === 0)).toBe(true);
    expect(c.id).not.toBe(newCharacter().id);
  });
  it('lists 18 skills in PDF order', () => {
    expect(SKILLS).toHaveLength(18);
    expect(SKILLS[0]?.label).toBe('Acrobatics');
    expect(SKILLS[17]?.label).toBe('Survival');
    expect(SKILLS.find((s) => s.key === 'sleightOfHand')?.ability).toBe('dex');
  });
});
