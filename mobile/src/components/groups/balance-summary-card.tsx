import { StyleSheet } from 'react-native';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/format';

type BalanceSummaryCardProps = {
  balance: number;
};

export function BalanceSummaryCard({ balance }: BalanceSummaryCardProps) {
  const currency = useCurrency();
  const theme = useTheme();
  const isSettled = Math.abs(balance) < 0.005;
  const isOwed = balance > 0;
  const color = isSettled ? theme.textSecondary : isOwed ? theme.success : theme.danger;
  const label = isSettled ? "You're all settled up" : isOwed ? 'You are owed' : 'You owe';

  return (
    <Card style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      {!isSettled ? (
        <ThemedText type="title" style={[styles.amount, { color }]}>
          {formatCurrency(Math.abs(balance), currency)}
        </ThemedText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  amount: {
    fontSize: 32,
    lineHeight: 38,
  },
});
