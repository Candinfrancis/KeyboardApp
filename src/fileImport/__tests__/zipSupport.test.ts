import JSZip from 'jszip';
import {
  decodeUtf8,
  extractTecladoJsonFromZip,
  isZipSignature,
} from '../zipSupport';

describe('zipSupport', () => {
  it('detects PK zip signature', () => {
    expect(isZipSignature(new Uint8Array([0x50, 0x4b, 0x03, 0x04]))).toBe(true);
    expect(isZipSignature(new Uint8Array([0x7b, 0x22]))).toBe(false);
  });

  it('extracts teclado.json from zip root', async () => {
    const zip = new JSZip();
    zip.file('teclado.json', '{"layout":{},"theme":{},"buttons":[{"label":"A"}]}');
    const bytes = await zip.generateAsync({ type: 'uint8array' });

    const json = await extractTecladoJsonFromZip(bytes);
    expect(json).toContain('"layout"');
  });

  it('extracts teclado.json from nested folder', async () => {
    const zip = new JSZip();
    zip.file('folder/teclado.json', '{"layout":{},"theme":{},"buttons":[{"label":"A"}]}');
    const bytes = await zip.generateAsync({ type: 'uint8array' });

    const json = await extractTecladoJsonFromZip(bytes);
    expect(json).toContain('"theme"');
  });

  it('fails when teclado.json is missing', async () => {
    const zip = new JSZip();
    zip.file('other.json', '{}');
    const bytes = await zip.generateAsync({ type: 'uint8array' });

    await expect(extractTecladoJsonFromZip(bytes)).rejects.toThrow(
      /missing teclado\.json/i,
    );
  });

  it('decodes utf8 for non-zip payloads', () => {
    const bytes = new Uint8Array([0x7b, 0x7d]);
    expect(decodeUtf8(bytes)).toBe('{}');
  });
});
