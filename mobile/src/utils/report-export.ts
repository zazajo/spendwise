import { Platform } from 'react-native';

const MIME_TYPES: Record<string, string> = {
  csv: 'text/csv',
  json: 'application/json',
};

// iOS's share sheet identifies content by UTI, not MIME type - without one it
// can't tell which apps are able to accept the file.
const UTIS: Record<string, string> = {
  csv: 'public.comma-separated-values-text',
  json: 'public.json',
};

// expo-sharing/expo-file-system's native APIs don't map to anything meaningful on
// web (no sandboxed filesystem, no native share sheet), so web instead triggers a
// normal browser download via a Blob + object URL - the platform-appropriate
// equivalent of "share/save this file" there.
async function shareOnWeb(filename: string, content: string, mimeType: string): Promise<void> {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function shareOnNative(
  filename: string,
  content: string,
  mimeType: string,
  extension: string
): Promise<void> {
  const { File, Paths } = await import('expo-file-system');
  const Sharing = await import('expo-sharing');

  const file = new File(Paths.cache, filename);
  file.create({ intermediates: true, overwrite: true });
  file.write(content);

  if (!(await Sharing.isAvailableAsync())) {
    // This used to return silently, which made an unavailable share sheet
    // indistinguishable from a successful export - the caller reported success
    // and nothing appeared.
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(file.uri, {
    mimeType, // Android
    UTI: UTIS[extension], // iOS
    dialogTitle: filename,
  });
}

export async function shareReportFile(name: string, extension: string, content: string): Promise<void> {
  const filename = `${name.replace(/[^a-z0-9-_ ]/gi, '_')}.${extension}`;
  const mimeType = MIME_TYPES[extension] ?? 'text/plain';

  if (Platform.OS === 'web') {
    await shareOnWeb(filename, content, mimeType);
  } else {
    await shareOnNative(filename, content, mimeType, extension);
  }
}
