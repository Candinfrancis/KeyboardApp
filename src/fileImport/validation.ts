export interface PtmcTecladoParsedFile {
  layout: unknown;
  theme: {
    backgroundColor?: string;
    textColor?: string;
    [key: string]: unknown;
  };
  rows?: Array<Array<{ label?: string; [key: string]: unknown }>>;
  buttons?: Array<{ label?: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface PtmcValidationResult {
  valid: boolean;
  reason?: string;
}

export const PTMC_EXTENSION = '.ptmcteclado';
export const PTMC_TEXT_EXTENSION = '.ptmcteclado.txt';
export const JSON_EXTENSION = '.json';

export const hasSupportedPtmcExtension = (value: string): boolean => {
  const lowerValue = value.toLowerCase();
  return (
    lowerValue.endsWith(JSON_EXTENSION) ||
    lowerValue.endsWith(PTMC_EXTENSION) ||
    lowerValue.endsWith(PTMC_TEXT_EXTENSION)
  );
};

export const normalizePtmcFileName = (name: string): string => {
  if (name.toLowerCase().endsWith(PTMC_TEXT_EXTENSION)) {
    return name.slice(0, -4);
  }

  return name;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isButtonWithLabel = (value: unknown): boolean =>
  isObject(value) && typeof value.label === 'string';

export const validatePtmcTecladoStructure = (
  parsed: unknown,
): PtmcValidationResult => {
  if (!isObject(parsed)) {
    return { valid: false, reason: 'File root must be a JSON object.' };
  }

  if (!('layout' in parsed)) {
    return { valid: false, reason: 'Missing `layout` section.' };
  }

  if (!('theme' in parsed) || !isObject(parsed.theme)) {
    return { valid: false, reason: 'Missing or invalid `theme` section.' };
  }

  const hasButtonsArray =
    Array.isArray(parsed.buttons) && parsed.buttons.every(isButtonWithLabel);

  const hasRowsArray =
    Array.isArray(parsed.rows) &&
    parsed.rows.every(
      row => Array.isArray(row) && row.every(isButtonWithLabel),
    );

  if (!hasButtonsArray && !hasRowsArray) {
    return {
      valid: false,
      reason:
        'Missing button data. Provide `buttons` (array) or `rows` (array of arrays) with labeled buttons.',
    };
  }

  return { valid: true };
};
