import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import type { Expense } from '@/types/expense';
import { formatCurrency } from '@/utils/format';

type ExpenseListItemProps = {
  expense: Expense;
  onPress: () => void;
};

export function ExpenseListItem({ expense, onPress }: ExpenseListItemProps) {
  const currency = useCurrency();
  const categoryColor = expense.category_details?.color ?? '#9AA0A6';

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.pressed]}>
          <View style={[styles.colorDot, { backgroundColor: categoryColor }]} />
          <View style={styles.middle}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {expense.description}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {expense.category_name ?? 'Uncategorized'} · {expense.date}
            </ThemedText>
          </View>
          <ThemedText type="smallBold">{formatCurrency(expense.amount, currency)}</ThemedText>
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
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  middle: {
    flex: 1,
    gap: Spacing.half,
  },
});
