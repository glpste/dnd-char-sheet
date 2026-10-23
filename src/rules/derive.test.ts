import { newCharacter, type Character, type Weapon } from '../model/character';
import {
  abilityMod,
  clampScore,
  formatMod,
  initiative,
  passivePerception,
  proficiencyBonus,
  saveTotal,
  skillTotal,
  spellAttackBonus,
  spellSaveDc,
  weaponAttackBonus,
  weaponDamageBonus,
} from './derive';

function ranger(): Character {
  const c = newCharacter('Thalia');
  c.info.level = 5;
  c.abilities = { str: 16, dex: 18, con: 14, int: 10, wis: 15, cha: 8 };
  return c;
}

function weapon(over: Partial<Weapon>): Weapon {
  return {
    id: 'w1', name: 'Shortsword', ability: 'finesse', proficient: true, magicBonus: 0,
    damageDice: '1d6', damageType: 'piercing', range: '5 ft', properties: '', effects: '', notes: '',
    ...over,
  };
}

describe('abilityMod', () => {
  it.each([[10, 0], [8, -1], [18, 4], [1, -5], [30, 10]])('score %i → %i', (s, m) => {
    expect(abilityMod(s)).toBe(m);
  });
});

describe('clampScore', () => {
  it('clamps ability scores to 1–30 and treats NaN as 10', () => {
    expect(clampScore(0)).toBe(1);
    expect(clampScore(31)).toBe(30);
    expect(clampScore(NaN)).toBe(10);
  });
  it('treats non-numbers and infinities as 10', () => {
    expect(clampScore('abc' as unknown as number)).toBe(10);
    expect(clampScore(Infinity)).toBe(10);
    expect(proficiencyBonus('x' as unknown as number)).toBe(2);
  });
});

describe('proficiencyBonus', () => {
  it.each([[1, 2], [4, 2], [5, 3], [17, 6], [20, 6], [0, 2], [25, 6]])('level %i → +%i', (l, b) => {
    expect(proficiencyBonus(l)).toBe(b);
  });
});

describe('saveTotal', () => {
  it('adds proficiency when proficient', () => {
    const c = ranger();
    c.saves.str.proficient = true;
    expect(saveTotal(c, 'str')).toBe(6);
  });
  it('honours override', () => {
    const c = ranger();
    c.saves.str.override = 9;
    expect(saveTotal(c, 'str')).toBe(9);
  });
});

describe('skillTotal', () => {
  it('doubles proficiency for expertise', () => {
    const c = ranger();
    c.skills.stealth.proficiency = 'expertise';
    expect(skillTotal(c, 'stealth')).toBe(10);
  });
});

describe('passivePerception and initiative', () => {
  it('passive perception is 10 + perception total', () => {
    const c = ranger();
    c.skills.perception.proficiency = 'proficient';
    expect(passivePerception(c)).toBe(15);
  });
  it('initiative is the dex modifier unless overridden', () => {
    const c = ranger();
    expect(initiative(c)).toBe(4);
    c.combat.initiativeOverride = 1;
    expect(initiative(c)).toBe(1);
  });
});

describe('weapon bonuses', () => {
  it('finesse uses the higher of str/dex plus prof and magic', () => {
    const c = ranger();
    expect(weaponAttackBonus(c, weapon({ magicBonus: 1 }))).toBe(8);
    expect(weaponDamageBonus(c, weapon({ magicBonus: 1 }))).toBe(5);
  });
  it('no ability, not proficient, no magic is +0', () => {
    const c = ranger();
    expect(weaponAttackBonus(c, weapon({ ability: 'none', proficient: false }))).toBe(0);
  });
  it('honours overrides', () => {
    const c = ranger();
    expect(weaponAttackBonus(c, weapon({ attackOverride: 11 }))).toBe(11);
    expect(weaponDamageBonus(c, weapon({ damageBonusOverride: 2 }))).toBe(2);
  });
});

describe('spellcasting', () => {
  it('returns null without a spellcasting ability', () => {
    const c = ranger();
    expect(spellSaveDc(c)).toBeNull();
    expect(spellAttackBonus(c)).toBeNull();
  });
  it('computes DC and attack from the chosen ability', () => {
    const c = ranger();
    c.spellbook.ability = 'wis';
    expect(spellSaveDc(c)).toBe(13);
    expect(spellAttackBonus(c)).toBe(5);
  });
});

describe('formatMod', () => {
  it('always shows a sign', () => {
    expect(formatMod(0)).toBe('+0');
    expect(formatMod(3)).toBe('+3');
    expect(formatMod(-1)).toBe('-1');
  });
});
