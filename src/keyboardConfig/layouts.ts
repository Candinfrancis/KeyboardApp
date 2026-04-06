import {
  AndroidKeyboardLayoutId,
  AndroidKeyboardModeId,
  AndroidKeyboardRowConfig,
} from './types';

const modeSwitcherRow: AndroidKeyboardRowConfig = [
  { id: 'mode-qwerty', label: 'ABC', actionType: 'switchMode', payload: 'qwerty' },
  { id: 'mode-words', label: 'Words', actionType: 'switchMode', payload: 'words' },
  { id: 'mode-photos', label: 'Photos', actionType: 'switchMode', payload: 'photos' },
  { id: 'mode-audio', label: 'Audio', actionType: 'switchMode', payload: 'audio' },
];

const controlRow: AndroidKeyboardRowConfig = [
  { id: 'shift', label: 'Shift', actionType: 'shift' },
  { id: 'caps', label: 'Caps', actionType: 'capsLock' },
  { id: 'space', label: 'Space', actionType: 'space' },
  { id: 'bksp', label: 'Bksp', actionType: 'backspace' },
  { id: 'enter', label: 'Enter', actionType: 'imeAction' },
];

const qwertyControlRow: AndroidKeyboardRowConfig = [
  { id: 'shift', label: 'Shift', actionType: 'shift' },
  { id: 'caps', label: 'Caps', actionType: 'capsLock' },
  { id: 'mode-numbers', label: '?123', actionType: 'switchMode', payload: 'numbers' },
  { id: 'space', label: 'Space', actionType: 'space' },
  { id: 'bksp', label: 'Bksp', actionType: 'backspace' },
  { id: 'enter', label: 'Enter', actionType: 'imeAction' },
];

const numbersControlRow: AndroidKeyboardRowConfig = [
  { id: 'shift', label: 'Shift', actionType: 'shift' },
  { id: 'caps', label: 'Caps', actionType: 'capsLock' },
  { id: 'mode-qwerty-from-numbers', label: 'ABC', actionType: 'switchMode', payload: 'qwerty' },
  { id: 'space', label: 'Space', actionType: 'space' },
  { id: 'bksp', label: 'Bksp', actionType: 'backspace' },
  { id: 'enter', label: 'Enter', actionType: 'imeAction' },
];

const languageRow: AndroidKeyboardRowConfig = [
  { id: 'lang', label: 'Lang', actionType: 'switchLanguage' },
  { id: 'nextkb', label: 'Next KB', actionType: 'nextKeyboard' },
];

const numberRow: AndroidKeyboardRowConfig = [
  { id: 'num-1', label: '1', actionType: 'letter', payload: '1' },
  { id: 'num-2', label: '2', actionType: 'letter', payload: '2' },
  { id: 'num-3', label: '3', actionType: 'letter', payload: '3' },
  { id: 'num-4', label: '4', actionType: 'letter', payload: '4' },
  { id: 'num-5', label: '5', actionType: 'letter', payload: '5' },
  { id: 'num-6', label: '6', actionType: 'letter', payload: '6' },
  { id: 'num-7', label: '7', actionType: 'letter', payload: '7' },
  { id: 'num-8', label: '8', actionType: 'letter', payload: '8' },
  { id: 'num-9', label: '9', actionType: 'letter', payload: '9' },
  { id: 'num-0', label: '0', actionType: 'letter', payload: '0' },
];

const symbolRow: AndroidKeyboardRowConfig = [
  { id: 'sym-ampersand', label: '&', actionType: 'letter', payload: '&' },
  { id: 'sym-asterisk', label: '*', actionType: 'letter', payload: '*' },
  { id: 'sym-left-paren', label: '(', actionType: 'letter', payload: '(' },
  { id: 'sym-right-paren', label: ')', actionType: 'letter', payload: ')' },
  { id: 'sym-plus', label: '+', actionType: 'letter', payload: '+' },
  { id: 'sym-equals', label: '=', actionType: 'letter', payload: '=' },
  { id: 'sym-slash', label: '/', actionType: 'letter', payload: '/' },
  { id: 'sym-percent', label: '%', actionType: 'letter', payload: '%' },
  { id: 'sym-dollar', label: '$', actionType: 'letter', payload: '$' },
  { id: 'sym-underscore', label: '_', actionType: 'letter', payload: '_' },
];

const punctuationRow: AndroidKeyboardRowConfig = [
  { id: 'punc-comma', label: ',', actionType: 'letter', payload: ',' },
  { id: 'punc-period', label: '.', actionType: 'letter', payload: '.' },
  { id: 'punc-question', label: '?', actionType: 'letter', payload: '?' },
  { id: 'punc-exclamation', label: '!', actionType: 'letter', payload: '!' },
  { id: 'punc-at', label: '@', actionType: 'letter', payload: '@' },
  { id: 'punc-hash', label: '#', actionType: 'letter', payload: '#' },
  { id: 'punc-hyphen', label: '-', actionType: 'letter', payload: '-' },
  { id: 'punc-apostrophe', label: "'", actionType: 'letter', payload: "'" },
];

const qwertyRows: AndroidKeyboardRowConfig[] = [
  [
    { id: 'q', label: 'Q', actionType: 'letter', payload: 'q' },
    { id: 'w', label: 'W', actionType: 'letter', payload: 'w' },
    { id: 'e', label: 'E', actionType: 'letter', payload: 'e' },
    { id: 'r', label: 'R', actionType: 'letter', payload: 'r' },
    { id: 't', label: 'T', actionType: 'letter', payload: 't' },
    { id: 'y', label: 'Y', actionType: 'letter', payload: 'y' },
    { id: 'u', label: 'U', actionType: 'letter', payload: 'u' },
    { id: 'i', label: 'I', actionType: 'letter', payload: 'i' },
    { id: 'o', label: 'O', actionType: 'letter', payload: 'o' },
    { id: 'p', label: 'P', actionType: 'letter', payload: 'p' },
  ],
  [
    { id: 'a', label: 'A', actionType: 'letter', payload: 'a' },
    { id: 's', label: 'S', actionType: 'letter', payload: 's' },
    { id: 'd', label: 'D', actionType: 'letter', payload: 'd' },
    { id: 'f', label: 'F', actionType: 'letter', payload: 'f' },
    { id: 'g', label: 'G', actionType: 'letter', payload: 'g' },
    { id: 'h', label: 'H', actionType: 'letter', payload: 'h' },
    { id: 'j', label: 'J', actionType: 'letter', payload: 'j' },
    { id: 'k', label: 'K', actionType: 'letter', payload: 'k' },
    { id: 'l', label: 'L', actionType: 'letter', payload: 'l' },
  ],
  [
    { id: 'z', label: 'Z', actionType: 'letter', payload: 'z' },
    { id: 'x', label: 'X', actionType: 'letter', payload: 'x' },
    { id: 'c', label: 'C', actionType: 'letter', payload: 'c' },
    { id: 'v', label: 'V', actionType: 'letter', payload: 'v' },
    { id: 'b', label: 'B', actionType: 'letter', payload: 'b' },
    { id: 'n', label: 'N', actionType: 'letter', payload: 'n' },
    { id: 'm', label: 'M', actionType: 'letter', payload: 'm' },
  ],
  qwertyControlRow,
  languageRow,
  modeSwitcherRow,
];

const numbersRows: AndroidKeyboardRowConfig[] = [
  numberRow,
  symbolRow,
  punctuationRow,
  numbersControlRow,
  languageRow,
  modeSwitcherRow,
];

const wordsRows: AndroidKeyboardRowConfig[] = [
  [
    { id: 'w-hello', label: 'Hello', actionType: 'word', payload: 'Hello' },
    { id: 'w-thanks', label: 'Thanks', actionType: 'word', payload: 'Thanks' },
    { id: 'w-yes', label: 'Yes', actionType: 'word', payload: 'Yes' },
    { id: 'w-no', label: 'No', actionType: 'word', payload: 'No' },
  ],
  [
    { id: 'w-onmyway', label: 'On my way', actionType: 'word', payload: 'On my way' },
    { id: 'w-calllater', label: 'Call you later', actionType: 'word', payload: 'I will call you later.' },
  ],
  [
    { id: 'w-email', label: 'Send details', actionType: 'word', payload: 'Please send me the details.' },
    { id: 'w-meeting', label: 'In a meeting', actionType: 'word', payload: 'I am in a meeting right now.' },
  ],
  controlRow,
  languageRow,
  modeSwitcherRow,
];

const photosRows: AndroidKeyboardRowConfig[] = [
  [
    { id: 'p-gif', label: 'GIF', actionType: 'photo', payload: 'test_image.gif|image/webp.wasticker' },
    { id: 'p-webp', label: 'WEBP', actionType: 'photo', payload: 'test_image.webp|webp.wasticker' },
    { id: 'p-ico', label: 'ICO', actionType: 'photo', payload: 'test_image.ico|webp.wasticker' },
  ],
  [
    { id: 'p-jpg-1', label: 'JPG', actionType: 'photo', payload: 'test_image.jpg|webp.wasticker' },
    { id: 'p-tiff', label: 'TIFF', actionType: 'photo', payload: 'test_image.tiff|webp.wasticker' },
    { id: 'p-psd', label: 'PSD', actionType: 'photo', payload: 'test_image.psd|webp.wasticker' },
  ],
  [
    { id: 'p-ps', label: 'PS', actionType: 'photo', payload: 'test_image.ps|webp.wasticker' },
    { id: 'p-eps', label: 'EPS', actionType: 'photo', payload: 'test_image.eps|webp.wasticker' },
    { id: 'p-odd', label: 'ODD', actionType: 'photo', payload: 'test_image.odd|webp.wasticker' },
  ],
  [
    { id: 'p-bmp', label: 'BMP', actionType: 'photo', payload: 'test_image.bmp|webp.wasticker' },
    { id: 'p-avif', label: 'AVIF', actionType: 'photo', payload: 'test_image.avif|webp.wasticker' },
  ],
  modeSwitcherRow,
];
const audioRows: AndroidKeyboardRowConfig[] = [
  // [
  //   { id: 'a-greeting', label: 'Greeting', actionType: 'audio', payload: 'greeting.m4a' },
  //   { id: 'a-status', label: 'Status update', actionType: 'audio', payload: 'status-update.m4a' },
  //   { id: 'a-followup', label: 'Follow up', actionType: 'audio', payload: 'follow-up.m4a' },
  // ],
  // [
  //   { id: 'a-note', label: 'Voice note', actionType: 'audio', payload: 'voice-note.m4a' },
  //   { id: 'a-reminder', label: 'Reminder', actionType: 'audio', payload: 'reminder.m4a' },
  //   { id: 'a-summary', label: 'Meeting summary', actionType: 'audio', payload: 'meeting-summary.m4a' },
  // ],
  [
    // { id: 'a-record', label: 'Record now', actionType: 'audio', payload: 'record-now.m4a' },
    // { id: 'a-pick', label: 'Pick clip', actionType: 'audio', payload: 'test_audio.m4a' },
    { id: 'a-test', label: 'Test Audio', actionType: 'audio', payload: 'test_audio.m4a' }
  ],
  modeSwitcherRow,
];

export const androidKeyboardLayouts: Record<
  AndroidKeyboardLayoutId,
  Record<AndroidKeyboardModeId, AndroidKeyboardRowConfig[]>
> = {
  multiMode: {
    qwerty: qwertyRows,
    numbers: numbersRows,
    words: wordsRows,
    photos: photosRows,
    audio: audioRows,
  },
};
