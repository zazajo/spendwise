import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { BudgetAlert } from '@/types/budget';

type BudgetAlertItemProps = {
  alert: BudgetAlert;
  onMarkRead: () => void;
  isMarkingRead?: boolean;
};

export function BudgetAlertItem({ alert, onMarkRead, isMarkingRead }: BudgetAlertItemProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: theme.warningSoft }]}>
        <Ionicons name="alert-circle" size={16} color={theme.warning} />
      </View>
      <View style={styles.middle}>
        <ThemedText type="small" numberOfLines={2}>
          {alert.message}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {alert.budget_category}
        </ThemedText>
      </View>
      <Pressable disabled={isMarkingRead} onPress={onMarkRead} hitSlop={8}>
        <Ionicons name="checkmark-circle-outline" size={22} color={theme.textSecondary} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
});
