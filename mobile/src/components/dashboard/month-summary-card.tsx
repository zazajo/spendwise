import { StyleSheet } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/format';

type MonthSummaryCardProps = {
  totalAmount: number;
  expenseCount: number;
};

export function MonthSummaryCard({ totalAmount, expenseCount }: MonthSummaryCardProps) {
  const currency = useCurrency();
  const monthName = new Date().toLocaleDateString(undefined, { month: 'long' });

  return (
    <Card style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        Total spent in {monthName}
      </ThemedText>
      <ThemedText type="title" style={styles.amount}>
        {formatCurrency(totalAmount, currency)}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'} this month
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.half,
  },
  amount: {
    fontSize: 36,
    lineHeight: 42,
  },
});
