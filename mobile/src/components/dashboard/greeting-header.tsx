import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type GreetingHeaderProps = {
  name: string;
  greeting: string;
};

export function GreetingHeader({ name, greeting }: GreetingHeaderProps) {
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
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <ThemedText type="smallBold" style={styles.avatarText}>
          {initial}
        </ThemedText>
      </View>
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
});
