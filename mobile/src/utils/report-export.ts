import { Platform } from 'react-native';

const MIME_TYPES: Record<string, string> = {
  csv: 'text/csv',
  json: 'application/json',
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

async function shareOnNative(filename: string, content: string, mimeType: string): Promise<void> {
  const { File, Paths } = await import('expo-file-system');
  const Sharing = await import('expo-sharing');

  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(content);

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: filename });
  }
}

export async function shareReportFile(name: string, extension: string, content: string): Promise<void> {
  const filename = `${name.replace(/[^a-z0-9-_ ]/gi, '_')}.${extension}`;
  const mimeType = MIME_TYPES[extension] ?? 'text/plain';

  if (Platform.OS === 'web') {
    await shareOnWeb(filename, content, mimeType);
  } else {
    await shareOnNative(filename, content, mimeType);
  }
}
