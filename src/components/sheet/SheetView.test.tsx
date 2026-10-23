import { screen } from '@testing-library/react';
import { renderWithCharacter } from '../../test/renderWithCharacter';
import { SheetView } from './SheetView';

const LABELS = [
  'Inspiration',
  'Proficiency bonus',
  'Saving throws',
  'Skills',
  'Passive perception',
  'Other proficiencies and languages',
  'Armor class',
  'Initiative',
  'Speed',
  'Hit points',
  'Temp',
  'Hit dice',
  'Death saves',
  'Weapons',
  'Equipment',
  'Personality traits',
  'Ideals',
  'Bonds',
  'Flaws',
  'Features and traits',
];

describe('SheetView', () => {
  it('renders every page-1 section of the PDF', () => {
    renderWithCharacter(<SheetView />);
    for (const label of LABELS) {
      expect(screen.getAllByText(label).length, label).toBeGreaterThan(0);
    }
    for (const a of ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']) {
      expect(screen.getByText(a)).toBeInTheDocument();
    }
    for (const coin of ['CP', 'SP', 'EP', 'GP', 'PP']) {
      expect(screen.getByLabelText(coin)).toBeInTheDocument();
    }
  });

  it('weapons region has max height class', () => {
    renderWithCharacter(<SheetView />);
    const region = screen.getByTestId('weapons-scroll');
    expect(region.className).toContain('overflow-y-auto');
    expect(region.className).toMatch(/max-h-/);
  });

  it('equipment text is height-capped', () => {
    renderWithCharacter(<SheetView />);
    const eq = screen.getByLabelText('Equipment');
    expect(eq.className).toContain('overflow-y-auto');
    expect(eq.className).toMatch(/max-h-/);
  });
});
