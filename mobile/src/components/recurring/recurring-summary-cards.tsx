import { StyleSheet, View } from 'react-native';

import { StatTile } from '@/components/analytics/stat-tile';
import { Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/format';

type RecurringSummaryCardsProps = {
  activeCount: number;
  pausedCount: number;
  completedCount: number;
  estimatedMonthlyTotal: number;
  overdueCount: number;
};

// Counts are derived client-side from getRecurringLifecycleStatus() (matching the
// Active/Paused/Completed sections below) rather than the backend summary's raw
// is_active split, so a naturally-ended (end_date passed) item shows as Completed
// here too instead of being lumped into "Paused".
export function RecurringSummaryCards({
  activeCount,
  pausedCount,
  completedCount,
  estimatedMonthlyTotal,
  overdueCount,
  }: RecurringSummaryCardsProps) {
  const currency = useCurrency();
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatTile label="Active" value={String(activeCount)} />
        <StatTile label="Paused" value={String(pausedCount)} />
      </View>
      <View style={styles.row}>
        <StatTile label="Completed" value={String(completedCount)} />
        <StatTile
          label="Overdue"
          value={String(overdueCount)}
          valueColor={overdueCount > 0 ? theme.danger : undefined}
        />
      </View>
      <View style={styles.row}>
        <StatTile label="Est. monthly total" value={formatCurrency(estimatedMonthlyTotal, currency)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
