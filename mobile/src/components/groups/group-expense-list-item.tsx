import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GroupExpense } from '@/types/group';
import { formatCurrency } from '@/utils/format';

type GroupExpenseListItemProps = {
  expense: GroupExpense;
  currency: string;
  onPress: () => void;
};

export function GroupExpenseListItem({ expense, currency, onPress }: GroupExpenseListItemProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.pressed]}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="receipt-outline" size={18} color={theme.primary} />
          </View>
          <View style={styles.middle}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {expense.description}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              Paid by {expense.paid_by_name} · {expense.date}
            </ThemedText>
          </View>
          <View style={styles.amountColumn}>
            <ThemedText type="smallBold">{formatCurrency(expense.amount, currency)}</ThemedText>
            <ThemedText
              type="small"
              style={{ color: expense.is_settled ? theme.success : theme.warning }}>
              {expense.is_settled ? 'Settled' : 'Unsettled'}
            </ThemedText>
          </View>
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
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
  amountColumn: {
    alignItems: 'flex-end',
    gap: Spacing.half,
  },
});
