import { StyleSheet, View } from 'react-native';

import { StatTile } from '@/components/analytics/stat-tile';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RecurringDashboardResponse } from '@/types/recurring';
import { formatCurrency } from '@/utils/format';

type RecurringSummaryCardsProps = {
  summary: RecurringDashboardResponse['summary'];
  currency: string;
};

export function RecurringSummaryCards({ summary, currency }: RecurringSummaryCardsProps) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatTile label="Active" value={String(summary.total_active)} />
        <StatTile label="Paused" value={String(summary.total_inactive)} />
      </View>
      <View style={styles.row}>
        <StatTile
          label="Est. monthly total"
          value={formatCurrency(summary.estimated_monthly_total, currency)}
        />
        <StatTile
          label="Overdue"
          value={String(summary.overdue_count)}
          valueColor={summary.overdue_count > 0 ? theme.danger : undefined}
        />
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
