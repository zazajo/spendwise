import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AvatarProps = {
  /** Absolute URL of the profile picture, or null/undefined to show initials. */
  uri?: string | null;
  initials: string;
  size?: number;
};

export function Avatar({ uri, initials, size = 76 }: AvatarProps) {
  const theme = useTheme();
  const shape = { width: size, height: size, borderRadius: Radius.pill };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={shape}
        contentFit="cover"
        // Uploading a new picture reuses the same URL, so without this the
        // cached copy of the old one would keep being shown.
        cachePolicy="none"
        accessibilityLabel="Profile picture"
      />
    );
  }

  return (
    <View style={[shape, styles.fallback, { backgroundColor: theme.primary }]}>
      <ThemedText style={[styles.initials, { fontSize: size * 0.37, lineHeight: size * 0.45 }]}>
        {initials}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
