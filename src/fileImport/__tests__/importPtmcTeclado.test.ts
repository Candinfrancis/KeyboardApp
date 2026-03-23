import {
  hasSupportedPtmcExtension,
  normalizePtmcFileName,
} from '../validation';

describe('keyboard import extension handling', () => {
  it('accepts .json extension', () => {
    expect(hasSupportedPtmcExtension('my-layout.json')).toBe(true);
  });

  it('accepts .ptmcteclado extension', () => {
    expect(hasSupportedPtmcExtension('my-layout.ptmcteclado')).toBe(true);
  });

  it('accepts .ptmcteclado.txt extension', () => {
    expect(hasSupportedPtmcExtension('my-layout.ptmcteclado.txt')).toBe(true);
  });

  it('normalizes .ptmcteclado.txt to .ptmcteclado', () => {
    expect(normalizePtmcFileName('my-layout.ptmcteclado.txt')).toBe(
      'my-layout.ptmcteclado',
    );
  });

  it('does not alter .json name', () => {
    expect(normalizePtmcFileName('my-layout.json')).toBe('my-layout.json');
  });
});
