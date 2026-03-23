export type TargetApp = 'whatsapp' | 'gmail' | 'notes' | 'browser';
export type FieldType = 'plainText' | 'richContent';

export interface MediaCapabilities {
  canDirectImage: boolean;
  canDirectAudio: boolean;
  fallbackReason: string;
}

export const detectMediaCapabilities = (
  platform: 'android' | 'ios',
  targetApp: TargetApp,
  fieldType: FieldType,
): MediaCapabilities => {
  const supportsRichImageCommit =
    platform === 'android' &&
    fieldType === 'richContent' &&
    (targetApp === 'notes' || targetApp === 'browser');

  if (supportsRichImageCommit) {
    return {
      canDirectImage: true,
      canDirectAudio: false,
      fallbackReason:
        'Image commitContent might work here, but audio direct-send is still unsupported.',
    };
  }

  return {
    canDirectImage: false,
    canDirectAudio: false,
    fallbackReason:
      'Target app/field usually accepts text only from keyboards. Use helper snippet fallback.',
  };
};
