import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { ProgressBar } from '@/components/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type {
  BudgetVarianceData,
  CategoryBreakdownData,
  MonthlySummaryData,
  ReportData,
  ReportType,
} from '@/types/reports';
import { formatCurrency } from '@/utils/format';

type ReportSummaryStatsProps = {
  reportType: ReportType;
  data: ReportData;
  currency: string;
};

export function ReportSummaryStats({ reportType, data, currency }: ReportSummaryStatsProps) {
  if (reportType === 'monthly_summary') {
    return <MonthlySummaryStats data={data as MonthlySummaryData} currency={currency} />;
  }
  if (reportType === 'category_analysis') {
    return <CategoryBreakdownStats data={data as CategoryBreakdownData} currency={currency} />;
  }
  return <BudgetVarianceStats data={data as BudgetVarianceData} currency={currency} />;
}

function MonthlySummaryStats({ data, currency }: { data: MonthlySummaryData; currency: string }) {
  const theme = useTheme();
  const trendColor = data.trend === 'up' ? theme.danger : data.trend === 'down' ? theme.success : theme.textSecondary;
  const trendIcon = data.trend === 'up' ? 'trending-up' : data.trend === 'down' ? 'trending-down' : 'remove';

  return (
    <View style={styles.stack}>
      <Card style={styles.statsCard}>
        <View style={styles.statRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Total spent
          </ThemedText>
          <ThemedText type="smallBold">{formatCurrency(data.total_spent, currency)}</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Top category
          </ThemedText>
          <ThemedText type="smallBold">
            {data.top_category} ({formatCurrency(data.top_category_amount, currency)})
          </ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Vs. previous month
          </ThemedText>
          <View style={styles.trendRow}>
            <Ionicons name={trendIcon} size={14} color={trendColor} />
            <ThemedText type="smallBold" style={{ color: trendColor }}>
              {Math.abs(data.change_percentage).toFixed(1)}%
            </ThemedText>
          </View>
        </View>
      </Card>

      <Card style={styles.statsCard}>
        <ThemedText type="smallBold">Category breakdown</ThemedText>
        {data.category_breakdown.map((row, index) => (
          <View key={`${row.category__name}-${index}`} style={styles.categoryRow}>
            <View style={styles.categoryLabel}>
              <View style={[styles.colorDot, { backgroundColor: row.category__color ?? theme.textSecondary }]} />
              <ThemedText type="small" numberOfLines={1}>
                {row.category__name ?? 'Uncategorized'}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {formatCurrency(row.total, currency)}
            </ThemedText>
          </View>
        ))}
      </Card>
    </View>
  );
}

function CategoryBreakdownStats({ data, currency }: { data: CategoryBreakdownData; currency: string }) {
  return (
    <View style={styles.stack}>
      <Card style={styles.statsCard}>
        <View style={styles.statRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Total expenses
          </ThemedText>
          <ThemedText type="smallBold">{formatCurrency(data.total_expenses, currency)}</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Transactions
          </ThemedText>
          <ThemedText type="smallBold">{data.total_transactions}</ThemedText>
        </View>
      </Card>

      <Card style={styles.statsCard}>
        <ThemedText type="smallBold">By category</ThemedText>
        {data.categories.map((category) => (
          <View key={category.category_id} style={styles.categoryBlock}>
            <View style={styles.categoryRow}>
              <View style={styles.categoryLabel}>
                <View style={[styles.colorDot, { backgroundColor: category.color }]} />
                <ThemedText type="small" numberOfLines={1}>
                  {category.category_name}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {formatCurrency(category.total, currency)} · {category.percentage.toFixed(0)}%
              </ThemedText>
            </View>
            <ProgressBar progress={category.percentage} color={category.color} height={6} />
          </View>
        ))}
        {data.categories.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            No spending in this range.
          </ThemedText>
        ) : null}
      </Card>
    </View>
  );
}

const VARIANCE_STATUS_COLOR: Record<BudgetVarianceData['categories'][number]['status'], ThemeColor> = {
  under: 'success',
  over: 'danger',
  on_track: 'textSecondary',
};

function BudgetVarianceStats({ data, currency }: { data: BudgetVarianceData; currency: string }) {
  const theme = useTheme();
  const totalColor = data.total_variance > 0 ? theme.danger : theme.success;

  return (
    <View style={styles.stack}>
      <Card style={styles.statsCard}>
        <View style={styles.statRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Total budget
          </ThemedText>
          <ThemedText type="smallBold">{formatCurrency(data.total_budget, currency)}</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Total actual
          </ThemedText>
          <ThemedText type="smallBold">{formatCurrency(data.total_actual, currency)}</ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText type="small" themeColor="textSecondary">
            Variance
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: totalColor }}>
            {data.total_variance > 0 ? '+' : ''}
            {formatCurrency(data.total_variance, currency)} ({data.total_variance_percentage.toFixed(1)}%)
          </ThemedText>
        </View>
      </Card>

      <Card style={styles.statsCard}>
        <ThemedText type="smallBold">By category</ThemedText>
        {data.categories.map((category) => {
          const color = theme[VARIANCE_STATUS_COLOR[category.status]];
          const usedPercentage =
            category.budget_amount > 0 ? (category.actual_amount / category.budget_amount) * 100 : 0;
          return (
            <View key={category.category_id} style={styles.categoryBlock}>
              <View style={styles.categoryRow}>
                <ThemedText type="small" numberOfLines={1}>
                  {category.category_name}
                </ThemedText>
                <ThemedText type="small" style={{ color }}>
                  {formatCurrency(category.actual_amount, currency)} / {formatCurrency(category.budget_amount, currency)}
                </ThemedText>
              </View>
              <ProgressBar progress={usedPercentage} color={color} height={6} />
            </View>
          );
        })}
        {data.categories.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            No active budgets for this period.
          </ThemedText>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.three,
  },
  statsCard: {
    gap: Spacing.two,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexShrink: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryBlock: {
    gap: Spacing.one,
  },
});
