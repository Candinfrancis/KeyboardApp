import { parseAndroidKeyboardConfig } from '../validateConfig';
import { buildAndroidKeyboardConfig } from '../buildConfig';

describe('parseAndroidKeyboardConfig', () => {
  it('returns fallback for null input', () => {
    const { config, usedFallback } = parseAndroidKeyboardConfig(null);

    expect(usedFallback).toBe(true);
    expect(config.platform).toBe('android');
    expect(config.configVersion).toBe(1);
  });

  it('returns fallback for malformed json', () => {
    const { usedFallback } = parseAndroidKeyboardConfig('{invalid-json');
    expect(usedFallback).toBe(true);
  });

  it('returns parsed config for valid payload', () => {
    const input = buildAndroidKeyboardConfig({
      themeName: 'dark',
      layoutId: 'multiMode',
    });

    const { config, usedFallback } = parseAndroidKeyboardConfig(
      JSON.stringify(input),
    );

    expect(usedFallback).toBe(false);
    expect(config.themeId).toBe('dark');
    expect(config.layoutId).toBe('multiMode');
    expect(config.modes.qwerty.length).toBeGreaterThan(0);
  });
});
