export const MEDIA_CONSENT_KEY = 'keyboard_media_consent_v1';

const sanitizeForToken = (value: string): string =>
  value
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-.:/]/g, '')
    .slice(0, 90);

export const buildPhotoSnippet = (uriOrFileName: string): string =>
  `[photo:${sanitizeForToken(uriOrFileName)}]`;

export const buildAudioSnippet = (uriOrFileName: string): string =>
  `[audio:${sanitizeForToken(uriOrFileName)}]`;

export const appendSnippet = (current: string, snippet: string): string =>
  current.length > 0 ? `${current} ${snippet}` : snippet;
