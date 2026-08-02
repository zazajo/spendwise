import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RecurringExpense } from '@/types/recurring';
import { formatCurrency } from '@/utils/format';
import { getDueUrgency } from '@/utils/recurring';

type RecurringUpcomingCardProps = {
  items: RecurringExpense[];
  currency: string;
  onPress: () => void;
};

export function RecurringUpcomingCard({ items, currency, onPress }: RecurringUpcomingCardProps) {
  const theme = useTheme();
  if (items.length === 0) return null;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card style={pressed ? [styles.card, styles.pressed] : styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="repeat" size={16} color={theme.primary} />
              </View>
              <ThemedText type="smallBold">Upcoming recurring</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>

          <View style={{ gap: Spacing.two }}>
            {items.map((item) => {
              const urgency = getDueUrgency(item.next_occurrence);
              const dueColor = urgency === 'overdue' ? theme.danger : urgency === 'due-soon' ? theme.warning : theme.textSecondary;
              return (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemMiddle}>
                    <ThemedText type="small" numberOfLines={1}>
                      {item.description}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: dueColor }}>
                      {item.next_occurrence_display}
                    </ThemedText>
                  </View>
                  <ThemedText type="smallBold">{formatCurrency(item.amount, currency)}</ThemedText>
                </View>
              );
            })}
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  itemMiddle: {
    flex: 1,
    gap: Spacing.half,
  },
});
