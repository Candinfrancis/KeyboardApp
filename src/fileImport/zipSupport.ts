import JSZip from 'jszip';

export const isZipSignature = (data: Uint8Array): boolean =>
  data.length >= 2 && data[0] === 0x50 && data[1] === 0x4b;

const findTecladoJsonEntry = (zip: JSZip): JSZip.JSZipObject | null => {
  const exact = zip.file('teclado.json');
  if (exact) {
    return exact;
  }

  const matches = zip.file(/(^|\/)teclado\.json$/i);
  return matches.length > 0 ? matches[0] : null;
};

export const extractTecladoJsonFromZip = async (
  data: Uint8Array,
): Promise<string> => {
  const zip = await JSZip.loadAsync(data);
  const tecladoEntry = findTecladoJsonEntry(zip);

  if (!tecladoEntry) {
    throw new Error('ZIP is missing teclado.json.');
  }

  const text = await tecladoEntry.async('string');

  if (!text) {
    throw new Error('teclado.json is empty.');
  }

  return text;
};

export const decodeUtf8 = (data: Uint8Array): string => {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(data);
};
