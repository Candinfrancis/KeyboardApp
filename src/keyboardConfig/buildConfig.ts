import { ThemeName, themes } from '../theme/themes';
import { androidKeyboardLayouts } from './layouts';
import {
  ANDROID_KEYBOARD_CONFIG_VERSION,
  AndroidKeyboardConfig,
  AndroidKeyboardLayoutId,
  AndroidKeyboardThemeConfig,
} from './types';

const asColor = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const mapTheme = (themeName: ThemeName): AndroidKeyboardThemeConfig => {
  const source = themes[themeName];

  return {
    backgroundColor: source.backgroundColor,
    textColor: source.textColor,
    keyBackgroundColor: asColor(source.buttonStyle.backgroundColor, '#2B90FF'),
    keyTextColor: asColor(source.buttonTextStyle.color, source.textColor),
    keyBorderColor: asColor(source.secondaryButtonStyle.borderColor, '#324251'),
  };
};

interface BuildAndroidKeyboardConfigInput {
  themeName: ThemeName;
  layoutId: AndroidKeyboardLayoutId;
}

export const buildAndroidKeyboardConfig = ({
  themeName,
  layoutId,
}: BuildAndroidKeyboardConfigInput): AndroidKeyboardConfig => ({
  platform: 'android',
  configVersion: ANDROID_KEYBOARD_CONFIG_VERSION,
  updatedAt: new Date().toISOString(),
  layoutId,
  defaultMode: 'qwerty',
  themeId: themeName,
  theme: mapTheme(themeName),
  modes: androidKeyboardLayouts[layoutId],
});
