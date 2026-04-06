export const ANDROID_KEYBOARD_CONFIG_VERSION = 1;

export type AndroidKeyboardLayoutId = 'multiMode';
export type AndroidKeyboardModeId = 'qwerty' | 'numbers' | 'words' | 'photos' | 'audio';

export type AndroidKeyboardActionType =
  | 'letter'
  | 'word'
  | 'photo'
  | 'audio'
  | 'backspace'
  | 'space'
  | 'newline'
  | 'shift'
  | 'capsLock'
  | 'nextKeyboard'
  | 'switchLanguage'
  | 'switchMode'
  | 'imeAction';

export interface AndroidKeyboardThemeConfig {
  backgroundColor: string;
  textColor: string;
  keyBackgroundColor: string;
  keyTextColor: string;
  keyBorderColor: string;
}

export interface AndroidKeyboardKeyConfig {
  id: string;
  label: string;
  actionType: AndroidKeyboardActionType;
  payload?: string;
}

export type AndroidKeyboardRowConfig = AndroidKeyboardKeyConfig[];

export interface AndroidKeyboardConfig {
  platform: 'android';
  configVersion: number;
  updatedAt: string;
  layoutId: AndroidKeyboardLayoutId;
  defaultMode: AndroidKeyboardModeId;
  themeId: 'light' | 'dark';
  theme: AndroidKeyboardThemeConfig;
  modes: Record<AndroidKeyboardModeId, AndroidKeyboardRowConfig[]>;
}

