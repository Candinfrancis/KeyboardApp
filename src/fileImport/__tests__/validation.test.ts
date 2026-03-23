import { validatePtmcTecladoStructure } from '../validation';

describe('validatePtmcTecladoStructure', () => {
  it('accepts rows-based structure', () => {
    const result = validatePtmcTecladoStructure({
      layout: { id: 'custom' },
      theme: { backgroundColor: '#000', textColor: '#fff' },
      rows: [[{ label: 'A' }, { label: 'Word' }]],
    });

    expect(result.valid).toBe(true);
  });

  it('accepts buttons-based structure', () => {
    const result = validatePtmcTecladoStructure({
      layout: { id: 'custom' },
      theme: { backgroundColor: '#000' },
      buttons: [{ label: 'A' }, { label: 'B' }],
    });

    expect(result.valid).toBe(true);
  });

  it('rejects missing theme', () => {
    const result = validatePtmcTecladoStructure({
      layout: { id: 'custom' },
      rows: [[{ label: 'A' }]],
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/theme/i);
  });

  it('rejects missing button data', () => {
    const result = validatePtmcTecladoStructure({
      layout: { id: 'custom' },
      theme: { backgroundColor: '#000' },
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/button data/i);
  });
});
