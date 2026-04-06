import { AndroidKeyboardKeyConfig, AndroidKeyboardModeId } from '../keyboardConfig';

export interface KeyboardRuntimeState {
  textBuffer: string;
  isShiftEnabled: boolean;
  isCapsLockEnabled: boolean;
  activeLanguageIndex: number;
  activeKeyboardIndex: number;
  activeMode: AndroidKeyboardModeId;
}

export interface KeyboardActionResult {
  state: KeyboardRuntimeState;
  emittedText: string;
  sideEffect?: 'photo' | 'audio';
}

export const defaultRuntimeState: KeyboardRuntimeState = {
  textBuffer: '',
  isShiftEnabled: false,
  isCapsLockEnabled: false,
  activeLanguageIndex: 0,
  activeKeyboardIndex: 0,
  activeMode: 'qwerty',
};

const transformLetter = (
  source: string,
  isShiftEnabled: boolean,
  isCapsLockEnabled: boolean,
): string => {
  const shouldUppercase = isShiftEnabled || isCapsLockEnabled;
  return shouldUppercase ? source.toUpperCase() : source.toLowerCase();
};

const deleteLastChar = (value: string): string => {
  if (value.length === 0) {
    return value;
  }

  return value.slice(0, -1);
};

const isModeId = (value: string): value is AndroidKeyboardModeId =>
  value === 'qwerty' || value === 'numbers' || value === 'words' || value === 'photos' || value === 'audio';

export const applyKeyboardAction = (
  state: KeyboardRuntimeState,
  key: AndroidKeyboardKeyConfig,
  languageCount: number,
): KeyboardActionResult => {
  switch (key.actionType) {
    case 'letter': {
      const source = key.payload ?? key.label;
      const emittedText = transformLetter(
        source,
        state.isShiftEnabled,
        state.isCapsLockEnabled,
      );

      return {
        emittedText,
        state: {
          ...state,
          textBuffer: `${state.textBuffer}${emittedText}`,
          isShiftEnabled: state.isCapsLockEnabled ? state.isShiftEnabled : false,
        },
      };
    }

    case 'word': {
      const emittedText = key.payload ?? key.label;

      return {
        emittedText,
        state: {
          ...state,
          textBuffer: `${state.textBuffer}${emittedText}`,
          isShiftEnabled: false,
        },
      };
    }

    case 'space': {
      return {
        emittedText: ' ',
        state: {
          ...state,
          textBuffer: `${state.textBuffer} `,
          isShiftEnabled: false,
        },
      };
    }

    case 'newline': {
      return {
        emittedText: '\n',
        state: {
          ...state,
          textBuffer: `${state.textBuffer}\n`,
          isShiftEnabled: false,
        },
      };
    }

    case 'backspace': {
      return {
        emittedText: '',
        state: {
          ...state,
          textBuffer: deleteLastChar(state.textBuffer),
        },
      };
    }

    case 'shift': {
      return {
        emittedText: '',
        state: {
          ...state,
          isShiftEnabled: !state.isShiftEnabled,
        },
      };
    }

    case 'capsLock': {
      return {
        emittedText: '',
        state: {
          ...state,
          isCapsLockEnabled: !state.isCapsLockEnabled,
          isShiftEnabled: false,
        },
      };
    }

    case 'switchLanguage': {
      const safeLanguageCount = Math.max(languageCount, 1);

      return {
        emittedText: '',
        state: {
          ...state,
          activeLanguageIndex:
            (state.activeLanguageIndex + 1) % safeLanguageCount,
        },
      };
    }

    case 'nextKeyboard': {
      return {
        emittedText: '',
        state: {
          ...state,
          activeKeyboardIndex: state.activeKeyboardIndex + 1,
        },
      };
    }

    case 'switchMode': {
      if (!key.payload || !isModeId(key.payload)) {
        return {
          emittedText: '',
          state,
        };
      }

      return {
        emittedText: '',
        state: {
          ...state,
          activeMode: key.payload,
          isShiftEnabled: false,
        },
      };
    }

    case 'photo':
    case 'audio': {
      return {
        emittedText: '',
        sideEffect: key.actionType,
        state,
      };
    }

    default: {
      return {
        emittedText: '',
        state,
      };
    }
  }
};

