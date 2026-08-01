import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type InsightItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

export function InsightItem({ icon, text }: InsightItemProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={16} color={theme.primary} />
      </View>
      <ThemedText type="small" style={styles.text}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    lineHeight: 20,
  },
});
