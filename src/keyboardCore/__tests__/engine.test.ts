import {
  applyKeyboardAction,
  defaultRuntimeState,
  type KeyboardRuntimeState,
} from '../engine';
import { AndroidKeyboardKeyConfig } from '../../keyboardConfig';

const run = (
  state: KeyboardRuntimeState,
  key: AndroidKeyboardKeyConfig,
  languageCount = 3,
) => applyKeyboardAction(state, key, languageCount).state;

describe('applyKeyboardAction', () => {
  it('inserts lowercase letter by default', () => {
    const next = run(defaultRuntimeState, {
      id: 'a',
      label: 'A',
      actionType: 'letter',
      payload: 'a',
    });

    expect(next.textBuffer).toBe('a');
  });

  it('applies shift for one letter', () => {
    const withShift = run(defaultRuntimeState, {
      id: 'shift',
      label: 'Shift',
      actionType: 'shift',
    });

    const afterLetter = run(withShift, {
      id: 'a',
      label: 'A',
      actionType: 'letter',
      payload: 'a',
    });

    expect(afterLetter.textBuffer).toBe('A');
    expect(afterLetter.isShiftEnabled).toBe(false);
  });

  it('toggles caps lock and keeps uppercase', () => {
    const caps = run(defaultRuntimeState, {
      id: 'caps',
      label: 'Caps',
      actionType: 'capsLock',
    });

    const afterA = run(caps, {
      id: 'a',
      label: 'A',
      actionType: 'letter',
      payload: 'a',
    });

    const afterB = run(afterA, {
      id: 'b',
      label: 'B',
      actionType: 'letter',
      payload: 'b',
    });

    expect(afterB.textBuffer).toBe('AB');
    expect(afterB.isCapsLockEnabled).toBe(true);
  });

  it('handles word, space, newline and backspace', () => {
    const word = run(defaultRuntimeState, {
      id: 'hello',
      label: 'Hello',
      actionType: 'word',
      payload: 'Hello',
    });

    const spaced = run(word, {
      id: 'space',
      label: 'Space',
      actionType: 'space',
    });

    const newLine = run(spaced, {
      id: 'enter',
      label: 'Enter',
      actionType: 'newline',
    });

    const backspaced = run(newLine, {
      id: 'bksp',
      label: '?',
      actionType: 'backspace',
    });

    expect(backspaced.textBuffer).toBe('Hello ');
  });

  it('cycles language index', () => {
    const next = run(defaultRuntimeState, {
      id: 'lang',
      label: 'Lang',
      actionType: 'switchLanguage',
    });

    expect(next.activeLanguageIndex).toBe(1);

    const wrapped = run(
      { ...next, activeLanguageIndex: 2 },
      {
        id: 'lang',
        label: 'Lang',
        actionType: 'switchLanguage',
      },
      3,
    );

    expect(wrapped.activeLanguageIndex).toBe(0);
  });

  it('switches between keyboard modes', () => {
    const switched = run(defaultRuntimeState, {
      id: 'mode-words',
      label: 'Words',
      actionType: 'switchMode',
      payload: 'words',
    });

    expect(switched.activeMode).toBe('words');
  });
});
