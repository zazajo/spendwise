import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';

type GreetingHeaderProps = {
  name: string;
  greeting: string;
  /** The user's profile picture; falls back to their initial when unset. */
  avatarUri?: string | null;
  onPressAvatar?: () => void;
};

export function GreetingHeader({ name, greeting, avatarUri, onPressAvatar }: GreetingHeaderProps) {
  const initial = name.charAt(0).toUpperCase() || '?';

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.row}>
      <View style={styles.textColumn}>
        <ThemedText type="small" themeColor="textSecondary">
          {today}
        </ThemedText>
        <ThemedText type="title" style={styles.greeting} numberOfLines={1}>
          {greeting}, {name}
        </ThemedText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        disabled={!onPressAvatar}
        onPress={onPressAvatar}
        style={({ pressed }) => [pressed && styles.pressed]}>
        <Avatar uri={avatarUri} initials={initial} size={48} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textColumn: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    lineHeight: 32,
  },
  pressed: {
    opacity: 0.7,
  },
});
