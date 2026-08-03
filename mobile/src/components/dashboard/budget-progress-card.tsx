import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useTheme } from '@/hooks/use-theme';
import type { BudgetOverview } from '@/types/budget';
import { formatCurrency } from '@/utils/format';

type BudgetProgressCardProps = {
  overview: BudgetOverview;
  onSetBudget: () => void;
  emptyActionLabel?: string;
};

const STATUS_COLOR_KEY: Record<BudgetOverview['status'], 'success' | 'warning' | 'danger'> = {
  none: 'success',
  good: 'success',
  warning: 'warning',
  exceeded: 'danger',
};

const STATUS_LABEL: Record<BudgetOverview['status'], string> = {
  none: 'No active budget',
  good: 'On track',
  warning: 'Approaching limit',
  exceeded: 'Budget exceeded',
};

export function BudgetProgressCard({
  overview,
  onSetBudget,
  emptyActionLabel = 'Go to Budgets',
}: BudgetProgressCardProps) {
  const currency = useCurrency();
  const theme = useTheme();

  if (overview.budgetsCount === 0) {
    return (
      <Card>
        <EmptyState
          icon="wallet-outline"
          title="No active budget"
          message="Set a monthly budget to keep track of your spending."
          actionLabel={emptyActionLabel}
          onAction={onSetBudget}
        />
      </Card>
    );
  }

  const statusColor = theme[STATUS_COLOR_KEY[overview.status]];

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <ThemedText type="smallBold">Budget overview</ThemedText>
        <ThemedText type="small" style={{ color: statusColor }}>
          {STATUS_LABEL[overview.status]}
        </ThemedText>
      </View>

      <ProgressBar progress={overview.percentageUsed} color={statusColor} />

      <View style={styles.footerRow}>
        <ThemedText type="small" themeColor="textSecondary">
          {formatCurrency(overview.totalSpent, currency)} of {formatCurrency(overview.totalBudget, currency)}
        </ThemedText>
        <ThemedText type="smallBold">
          {formatCurrency(Math.max(overview.remainingTotal, 0), currency)} left
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
