import { formatDamage } from './formatDamage';

describe('formatDamage', () => {
  it('joins dice, bonus and type', () => {
    expect(formatDamage('1d8', 4, 'piercing')).toBe('1d8+4 piercing');
  });
  it('omits a zero bonus', () => {
    expect(formatDamage('1d8', 0, 'piercing')).toBe('1d8 piercing');
  });
  it('shows negative bonuses', () => {
    expect(formatDamage('1d6', -1, 'slashing')).toBe('1d6-1 slashing');
  });
  it('is empty without dice', () => {
    expect(formatDamage('', 4, 'piercing')).toBe('');
  });
  it('omits a missing type', () => {
    expect(formatDamage('2d6', 3, '')).toBe('2d6+3');
  });
});
