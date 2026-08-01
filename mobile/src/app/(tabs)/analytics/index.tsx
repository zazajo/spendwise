import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-dashboard-skeleton';
import { AnomalyListItem } from '@/components/analytics/anomaly-list-item';
import { HealthScoreCard } from '@/components/analytics/health-score-card';
import { InsightItem } from '@/components/analytics/insight-item';
import { TrendBarChart } from '@/components/analytics/trend-bar-chart';
import { Card } from '@/components/card';
import { CategoryBreakdownSection } from '@/components/dashboard/category-breakdown-section';
import { BudgetProgressCard } from '@/components/dashboard/budget-progress-card';
import { RecentExpensesSection } from '@/components/dashboard/recent-expenses-section';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAnalyticsDashboard } from '@/hooks/use-analytics-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { useBudgetSummary } from '@/hooks/use-budget-summary';
import { useCurrentMonthCategoryAnalysis } from '@/hooks/use-current-month-category-analysis';
import { useRecentExpenses } from '@/hooks/use-recent-expenses';
import type { MonthlyTrendPoint } from '@/types/analytics';
import type { TrendBucket } from '@/utils/analytics';
import { formatCurrency } from '@/utils/format';

function trendPointToBucket(point: MonthlyTrendPoint): TrendBucket {
  const start = new Date(point.year, point.month - 1, 1);
  return {
    key: `${point.year}-${point.month}`,
    label: point.month_name.slice(0, 3),
    total: Number(point.total_spent),
    start,
    end: new Date(point.year, point.month, 0),
  };
}

export default function AnalyticsDashboardScreen() {
  const { user } = useAuth();
  const currency = user?.profile.currency ?? '';
  const monthlyIncome = user?.profile.monthly_income ? Number(user.profile.monthly_income) : null;

  const dashboard = useAnalyticsDashboard();
  const categoryAnalysis = useCurrentMonthCategoryAnalysis();
  const budgetSummary = useBudgetSummary();
  const recentExpenses = useRecentExpenses(5);

  const isLoading =
    dashboard.isLoading || categoryAnalysis.isLoading || budgetSummary.isLoading || recentExpenses.isLoading;
  const isError = dashboard.isError;
  const isRefetching =
    dashboard.isRefetching ||
    categoryAnalysis.isRefetching ||
    budgetSummary.isRefetching ||
    recentExpenses.isRefetching;

  const refetchAll = useCallback(() => {
    return Promise.all([
      dashboard.refetch(),
      categoryAnalysis.refetch(),
      budgetSummary.refetch(),
      recentExpenses.refetch(),
    ]);
  }, [dashboard, categoryAnalysis, budgetSummary, recentExpenses]);

  const trendBuckets = useMemo(
    () => (dashboard.data ? [...dashboard.data.spending_trends].reverse().map(trendPointToBucket) : []),
    [dashboard.data]
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <AnalyticsDashboardSkeleton />
        </ScrollView>
      </ThemedView>
    );
  }

  if (isError || !dashboard.data) {
    return (
      <ThemedView style={styles.container}>
        <ErrorState message="Couldn't load your analytics." onRetry={refetchAll} />
      </ThemedView>
    );
  }

  const { financial_health, recent_anomalies, monthly_summary } = dashboard.data;
  const currentMonthExpenses = Number(monthly_summary.current_month_total);
  const savings = monthlyIncome !== null ? monthlyIncome - currentMonthExpenses : null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}>
        <HealthScoreCard health={financial_health} onPress={() => router.push('/analytics/health')} />

        <View style={styles.section}>
          <SectionHeader title="Monthly spending trends" actionLabel="See all" onAction={() => router.push('/analytics/trends')} />
          <Card>
            <TrendBarChart buckets={trendBuckets} currency={currency} />
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Spending by category"
            actionLabel="See all"
            onAction={() => router.push('/analytics/categories')}
          />
          <CategoryBreakdownSection categories={categoryAnalysis.data ?? []} currency={currency} />
        </View>

        {monthlyIncome !== null ? (
          <View style={styles.section}>
            <SectionHeader title="Income vs expenses" />
            <Card style={styles.incomeCard}>
              <View style={styles.incomeRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Income
                </ThemedText>
                <ThemedText type="smallBold">{formatCurrency(monthlyIncome, currency)}</ThemedText>
              </View>
              <View style={styles.incomeRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Expenses this month
                </ThemedText>
                <ThemedText type="smallBold">{formatCurrency(currentMonthExpenses, currency)}</ThemedText>
              </View>
              <View style={styles.incomeRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  {savings !== null && savings < 0 ? 'Shortfall' : 'Saved'}
                </ThemedText>
                <ThemedText type="smallBold">
                  {formatCurrency(Math.abs(savings ?? 0), currency)}
                </ThemedText>
              </View>
            </Card>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="Budget performance" actionLabel="See all" onAction={() => router.push('/budgets')} />
          <BudgetProgressCard
            overview={
              budgetSummary.data ?? {
                totalBudget: 0,
                totalSpent: 0,
                remainingTotal: 0,
                budgetsCount: 0,
                percentageUsed: 0,
                status: 'none',
              }
            }
            currency={currency}
            onSetBudget={() => router.push('/budgets/new')}
            emptyActionLabel="Create budget"
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Insights" />
          <Card style={{ gap: Spacing.three }}>
            <InsightItem
              icon="calendar-outline"
              text={`You spent ${formatCurrency(currentMonthExpenses, currency)} this month, ${
                monthly_summary.trend === 'up'
                  ? 'up'
                  : monthly_summary.trend === 'down'
                    ? 'down'
                    : 'flat'
              } ${Math.abs(monthly_summary.change_percentage).toFixed(1)}% from last month.`}
            />
            {financial_health.recommendations_list.map((tip, index) => (
              <InsightItem key={index} icon="bulb-outline" text={tip} />
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Recent anomalies"
            actionLabel="See all"
            onAction={() => router.push('/analytics/anomalies')}
          />
          {recent_anomalies.length === 0 ? (
            <Card>
              <EmptyState icon="shield-checkmark-outline" title="Nothing unusual detected" />
            </Card>
          ) : (
            <View style={{ gap: Spacing.two }}>
              {recent_anomalies.map((anomaly) => (
                <AnomalyListItem key={anomaly.expense_id} anomaly={anomaly} currency={currency} />
              ))}
            </View>
          )}
        </View>

        <RecentExpensesSection
          expenses={recentExpenses.data ?? []}
          currency={currency}
          onPressExpense={(id) => router.push({ pathname: '/expenses/[id]', params: { id: String(id) } })}
          onSeeAll={() => router.push('/expenses')}
          onAddExpense={() => router.push('/expenses/new')}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  section: {
    gap: Spacing.two,
  },
  incomeCard: {
    gap: Spacing.two,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
