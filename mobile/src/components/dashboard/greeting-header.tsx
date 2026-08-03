import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type GreetingHeaderProps = {
  name: string;
  greeting: string;
  onPressAvatar?: () => void;
};

export function GreetingHeader({ name, greeting, onPressAvatar }: GreetingHeaderProps) {
  const theme = useTheme();
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
        style={({ pressed }) => [
          styles.avatar,
          { backgroundColor: theme.primary },
          pressed && styles.pressed,
        ]}>
        <ThemedText type="smallBold" style={styles.avatarText}>
          {initial}
        </ThemedText>
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
  },
  pressed: {
    opacity: 0.7,
  },
});
