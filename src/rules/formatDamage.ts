/** "1d8" + 4 + "piercing" → "1d8+4 piercing"; empty dice → "". */
export function formatDamage(dice: string, bonus: number, type: string): string {
  const d = dice.trim();
  if (!d) return '';
  const b = bonus === 0 ? '' : bonus > 0 ? `+${bonus}` : `${bonus}`;
  const t = type.trim();
  return t ? `${d}${b} ${t}` : `${d}${b}`;
}
