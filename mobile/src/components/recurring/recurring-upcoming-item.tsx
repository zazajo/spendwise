import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RecurringExpense } from '@/types/recurring';
import { formatCurrency } from '@/utils/format';
import { getDueUrgency } from '@/utils/recurring';

type RecurringUpcomingItemProps = {
  recurring: RecurringExpense;
  currency: string;
  onPress: () => void;
};

export function RecurringUpcomingItem({ recurring, currency, onPress }: RecurringUpcomingItemProps) {
  const theme = useTheme();
  const urgency = getDueUrgency(recurring.next_occurrence);
  const dueColor = urgency === 'overdue' ? theme.danger : urgency === 'due-soon' ? theme.warning : theme.text;
  const dotColor = urgency === 'overdue' ? theme.danger : urgency === 'due-soon' ? theme.warning : theme.border;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.pressed]}>
          <View style={styles.timeline}>
            <View style={[styles.dot, { backgroundColor: dotColor }]} />
          </View>
          <View style={styles.middle}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {recurring.description}
            </ThemedText>
            <View style={styles.dueRow}>
              {urgency === 'overdue' ? <Ionicons name="alert-circle" size={12} color={dueColor} /> : null}
              <ThemedText type="small" style={{ color: dueColor }}>
                {recurring.next_occurrence_display}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="smallBold">{formatCurrency(recurring.amount, currency)}</ThemedText>
        </ThemedView>
      )}
    </Pressable>
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
  pressed: {
    opacity: 0.7,
  },
  timeline: {
    width: 10,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
});
