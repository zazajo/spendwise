import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type QuickAction = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type QuickActionsProps = {
  actions: QuickAction[];
};

export function QuickActions({ actions }: QuickActionsProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          onPress={action.onPress}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name={action.icon} size={22} color={theme.primary} />
          </View>
          <ThemedText type="small" style={styles.label}>
            {action.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
