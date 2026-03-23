import { keepLocalCopy, pick, types } from '@react-native-documents/picker';
import {
  hasSupportedPtmcExtension,
  normalizePtmcFileName,
  PTMC_EXTENSION,
  PtmcTecladoParsedFile,
  validatePtmcTecladoStructure,
} from './validation';
import { decodeUtf8, extractTecladoJsonFromZip, isZipSignature } from './zipSupport';

export interface ImportedPtmcTecladoResult {
  fileName: string;
  fileUri: string;
  rawContents: string;
  parsed: PtmcTecladoParsedFile;
}

const ensurePtmcExtension = (name: string, uri: string): void => {
  if (!hasSupportedPtmcExtension(name) && !hasSupportedPtmcExtension(uri)) {
    throw new Error(
      'Selected file must use .json, .ptmcteclado, or .ptmcteclado.txt extension.',
    );
  }
};

const readBinaryFromUri = async (uri: string): Promise<Uint8Array> => {
  const response = await fetch(uri);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
};

const readRawPtmcFile = async (
  fileUri: string,
  fileName: string,
): Promise<string> => {
  const tryReadFromUri = async (uri: string): Promise<string> => {
    const binary = await readBinaryFromUri(uri);

    if (binary.length === 0) {
      throw new Error('File is empty.');
    }

    if (isZipSignature(binary)) {
      try {
        return await extractTecladoJsonFromZip(binary);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown ZIP error.';
        throw new Error(`Invalid .ptmcteclado ZIP: ${reason}`);
      }
    }

    return decodeUtf8(binary);
  };

  try {
    const copied = await keepLocalCopy({
      destination: 'cachesDirectory',
      files: [{ uri: fileUri, fileName }],
    });

    const successCopy = copied.find(entry => entry.status === 'success');
    if (successCopy && successCopy.status === 'success') {
      return await tryReadFromUri(successCopy.localUri);
    }
  } catch {
    // fall through to direct URI read
  }

  return tryReadFromUri(fileUri);
};

export const pickAndParsePtmcTecladoFile = async (): Promise<ImportedPtmcTecladoResult> => {
  const picked = await pick({
    type: [types.allFiles],
    allowMultiSelection: false,
  });

  const selected = picked[0];
  const pickedName = selected.name ?? `keyboard${PTMC_EXTENSION}`;

  ensurePtmcExtension(pickedName, selected.uri);

  const fileName = normalizePtmcFileName(pickedName);
  const rawContents = await readRawPtmcFile(selected.uri, fileName);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawContents);
  } catch {
    throw new Error('Invalid JSON in imported keyboard file.');
  }

  const validation = validatePtmcTecladoStructure(parsedJson);
  if (!validation.valid) {
    throw new Error(validation.reason ?? 'Invalid keyboard structure in imported file.');
  }

  return {
    fileName,
    fileUri: selected.uri,
    rawContents,
    parsed: parsedJson as PtmcTecladoParsedFile,
  };
};

