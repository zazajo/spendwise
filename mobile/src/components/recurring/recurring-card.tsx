import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { RecurringFrequencyBadge } from '@/components/recurring/recurring-frequency-badge';
import { RecurringStatusBadge } from '@/components/recurring/recurring-status-badge';
import { ThemedText } from '@/components/themed-text';
import { DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_ICON } from '@/constants/category-options';
import { Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useTheme } from '@/hooks/use-theme';
import { getRecurringLifecycleStatus, type RecurringExpense } from '@/types/recurring';
import { getDueUrgency } from '@/utils/recurring';
import { formatCurrency } from '@/utils/format';

type RecurringCardProps = {
  recurring: RecurringExpense;
  categoryColor?: string;
  categoryIcon?: string;
  onPress: () => void;
  onLongPress?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
};

export function RecurringCard({
  recurring,
  categoryColor = DEFAULT_CATEGORY_COLOR,
  categoryIcon = DEFAULT_CATEGORY_ICON,
  onPress,
  onLongPress,
  selectionMode = false,
  selected = false,
}: RecurringCardProps) {
  const currency = useCurrency();
  const theme = useTheme();
  const status = getRecurringLifecycleStatus(recurring);
  const urgency = status === 'active' ? getDueUrgency(recurring.next_occurrence) : null;
  const dueColor =
    urgency === 'overdue' ? theme.danger : urgency === 'due-soon' ? theme.warning : theme.textSecondary;

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      {({ pressed }) => (
        <Card
          style={[
            styles.card,
            pressed && styles.pressed,
            selected && { borderColor: theme.primary, borderWidth: 2 },
          ]}>
          <View style={styles.headerRow}>
            <View style={styles.identity}>
              {selectionMode ? (
                <Ionicons
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={selected ? theme.primary : theme.textSecondary}
                />
              ) : (
                <View style={[styles.iconCircle, { backgroundColor: categoryColor }]}>
                  <Ionicons
                    name={categoryIcon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color="#ffffff"
                  />
                </View>
              )}
              <View style={styles.identityText}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {recurring.description}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {recurring.category_name}
                </ThemedText>
              </View>
            </View>
            <RecurringStatusBadge status={status} />
          </View>

          <View style={styles.footerRow}>
            <RecurringFrequencyBadge frequency={recurring.frequency} interval={recurring.interval} />
            <ThemedText type="smallBold">{formatCurrency(recurring.amount, currency)}</ThemedText>
          </View>

          {status !== 'completed' ? (
            <View style={styles.dueRow}>
              {urgency === 'overdue' ? (
                <Ionicons name="alert-circle" size={14} color={dueColor} />
              ) : urgency === 'due-soon' ? (
                <Ionicons name="time" size={14} color={dueColor} />
              ) : null}
              <ThemedText type="small" style={{ color: dueColor }}>
                Next: {recurring.next_occurrence_display}
              </ThemedText>
            </View>
          ) : null}
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  identityText: {
    flexShrink: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
});
