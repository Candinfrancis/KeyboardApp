import {
  appendSnippet,
  buildAudioSnippet,
  buildPhotoSnippet,
  detectMediaCapabilities,
} from '../index';

describe('mediaFlow', () => {
  it('builds sanitized photo and audio snippets', () => {
    expect(buildPhotoSnippet('my photo.jpg')).toBe('[photo:my_photo.jpg]');
    expect(buildAudioSnippet('voice note.m4a')).toBe('[audio:voice_note.m4a]');
  });

  it('appends snippet to existing text buffer', () => {
    expect(appendSnippet('Hello', '[photo:file.jpg]')).toBe(
      'Hello [photo:file.jpg]',
    );
  });

  it('detects rich image capability for android rich content targets', () => {
    const capabilities = detectMediaCapabilities('android', 'notes', 'richContent');
    expect(capabilities.canDirectImage).toBe(true);
    expect(capabilities.canDirectAudio).toBe(false);
  });

  it('falls back for plain text targets', () => {
    const capabilities = detectMediaCapabilities('android', 'whatsapp', 'plainText');
    expect(capabilities.canDirectImage).toBe(false);
    expect(capabilities.fallbackReason.length).toBeGreaterThan(0);
  });
});
