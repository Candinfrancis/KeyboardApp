import { buildAndroidKeyboardConfig } from './buildConfig';
import {
  ANDROID_KEYBOARD_CONFIG_VERSION,
  AndroidKeyboardActionType,
  AndroidKeyboardConfig,
  AndroidKeyboardKeyConfig,
  AndroidKeyboardLayoutId,
  AndroidKeyboardModeId,
  AndroidKeyboardRowConfig,
} from './types';

const isActionType = (value: unknown): value is AndroidKeyboardActionType =>
  value === 'letter' ||
  value === 'word' ||
  value === 'photo' ||
  value === 'audio' ||
  value === 'backspace' ||
  value === 'space' ||
  value === 'newline' ||
  value === 'shift' ||
  value === 'capsLock' ||
  value === 'nextKeyboard' ||
  value === 'switchLanguage' ||
  value === 'switchMode' ||
  value === 'imeAction';

const isModeId = (value: unknown): value is AndroidKeyboardModeId =>
  value === 'qwerty' || value === 'numbers' || value === 'words' || value === 'photos' || value === 'audio';

const isKey = (value: unknown): value is AndroidKeyboardKeyConfig => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AndroidKeyboardKeyConfig>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.label === 'string' &&
    isActionType(candidate.actionType)
  );
};

const isRows = (value: unknown): value is AndroidKeyboardRowConfig[] =>
  Array.isArray(value) &&
  value.every(row => Array.isArray(row) && row.every(cell => isKey(cell)));

const isModes = (
  value: unknown,
): value is Record<AndroidKeyboardModeId, AndroidKeyboardRowConfig[]> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<Record<AndroidKeyboardModeId, AndroidKeyboardRowConfig[]>>;

  return (
    isRows(candidate.qwerty) &&
    isRows(candidate.numbers) &&
    isRows(candidate.words) &&
    isRows(candidate.photos) &&
    isRows(candidate.audio)
  );
};

export const isAndroidKeyboardConfig = (
  value: unknown,
): value is AndroidKeyboardConfig => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AndroidKeyboardConfig>;

  return (
    candidate.platform === 'android' &&
    candidate.configVersion === ANDROID_KEYBOARD_CONFIG_VERSION &&
    candidate.layoutId === 'multiMode' &&
    isModeId(candidate.defaultMode) &&
    (candidate.themeId === 'light' || candidate.themeId === 'dark') &&
    !!candidate.theme &&
    typeof candidate.theme.backgroundColor === 'string' &&
    typeof candidate.theme.textColor === 'string' &&
    typeof candidate.theme.keyBackgroundColor === 'string' &&
    typeof candidate.theme.keyTextColor === 'string' &&
    typeof candidate.theme.keyBorderColor === 'string' &&
    isModes(candidate.modes)
  );
};

interface ValidationResult {
  config: AndroidKeyboardConfig;
  usedFallback: boolean;
  fallbackReason: 'missing' | 'invalid' | null;
}

const defaultLayoutId: AndroidKeyboardLayoutId = 'multiMode';

export const getDefaultAndroidKeyboardConfig = (): AndroidKeyboardConfig =>
  buildAndroidKeyboardConfig({
    themeName: 'light',
    layoutId: defaultLayoutId,
  });

export const parseAndroidKeyboardConfig = (
  raw: string | null,
): ValidationResult => {
  if (!raw) {
    return {
      config: getDefaultAndroidKeyboardConfig(),
      usedFallback: true,
      fallbackReason: 'missing',
    };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (isAndroidKeyboardConfig(parsed)) {
      return { config: parsed, usedFallback: false, fallbackReason: null };
    }

    return {
      config: getDefaultAndroidKeyboardConfig(),
      usedFallback: true,
      fallbackReason: 'invalid',
    };
  } catch {
    return {
      config: getDefaultAndroidKeyboardConfig(),
      usedFallback: true,
      fallbackReason: 'invalid',
    };
  }
};

