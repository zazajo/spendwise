import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Fab } from '@/components/fab';
import { ProgressBar } from '@/components/progress-bar';
import { ReportCard } from '@/components/reports/report-card';
import { ReportListSkeleton } from '@/components/reports/report-list-skeleton';
import { ReportTrendsSummaryCard } from '@/components/reports/report-trends-summary-card';
import { SectionHeader } from '@/components/section-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useCurrency } from '@/hooks/use-currency';
import { useBudgetVarianceReport } from '@/hooks/use-budget-variance-report';
import { useCategoryBreakdownReport } from '@/hooks/use-category-breakdown-report';
import { useMonthlySummaryReport } from '@/hooks/use-monthly-summary-report';
import { useReports } from '@/hooks/use-reports';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/format';

const RECENT_COUNT = 5;

export default function ReportsDashboardScreen() {
  const theme = useTheme();
  const currency = useCurrency();

  const monthly = useMonthlySummaryReport();
  const budgetVariance = useBudgetVarianceReport();
  const categoryBreakdown = useCategoryBreakdownReport();
  const reports = useReports();

  const isLoading = monthly.isLoading || reports.isLoading;
  const isError = monthly.isError || reports.isError;
  const isRefetching =
    monthly.isRefetching || budgetVariance.isRefetching || categoryBreakdown.isRefetching || reports.isRefetching;

  const refetchAll = useCallback(() => {
    return Promise.all([
      monthly.refetch(),
      budgetVariance.refetch(),
      categoryBreakdown.refetch(),
      reports.refetch(),
    ]);
  }, [monthly, budgetVariance, categoryBreakdown, reports]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ReportListSkeleton />
        </ScrollView>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <ErrorState message="Couldn't load your reports." onRetry={refetchAll} />
      </ThemedView>
    );
  }

  const recentReports = (reports.data ?? []).slice(0, RECENT_COUNT);
  const topCategories = (categoryBreakdown.data?.categories ?? []).slice(0, 3);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}>
        <View style={styles.quickLinks}>
          <Pressable
            style={[styles.quickLink, { backgroundColor: theme.backgroundElement }]}
            onPress={() => router.push('/profile/reports/history')}>
            <Ionicons name="time-outline" size={16} color={theme.text} />
            <ThemedText type="smallBold">History</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.quickLink, { backgroundColor: theme.backgroundElement }]}
            onPress={() => router.push('/profile/reports/scheduled')}>
            <Ionicons name="alarm-outline" size={16} color={theme.text} />
            <ThemedText type="smallBold">Scheduled</ThemedText>
          </Pressable>
        </View>

        {monthly.data ? (
          <Card style={styles.card}>
            <SectionHeader title="This month" />
            <View style={styles.statRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Total spent
              </ThemedText>
              <ThemedText type="smallBold">{formatCurrency(monthly.data.total_spent, currency)}</ThemedText>
            </View>
            <View style={styles.statRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Top category
              </ThemedText>
              <ThemedText type="smallBold">{monthly.data.top_category}</ThemedText>
            </View>
          </Card>
        ) : null}

        <ReportTrendsSummaryCard onSeeAll={() => router.push('/analytics/trends')} />

        {budgetVariance.data ? (
          <Card style={styles.card}>
            <SectionHeader title="Budget variance" />
            <View style={styles.statRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Budget vs actual
              </ThemedText>
              <ThemedText
                type="smallBold"
                style={budgetVariance.data.total_variance > 0 ? { color: theme.danger } : { color: theme.success }}>
                {formatCurrency(budgetVariance.data.total_actual, currency)} /{' '}
                {formatCurrency(budgetVariance.data.total_budget, currency)}
              </ThemedText>
            </View>
          </Card>
        ) : null}

        {topCategories.length > 0 ? (
          <Card style={styles.card}>
            <SectionHeader title="Category breakdown" />
            <View style={{ gap: Spacing.two }}>
              {topCategories.map((category) => (
                <View key={category.category_id} style={{ gap: Spacing.one }}>
                  <View style={styles.statRow}>
                    <ThemedText type="small" numberOfLines={1}>
                      {category.category_name}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {category.percentage.toFixed(0)}%
                    </ThemedText>
                  </View>
                  <ProgressBar progress={category.percentage} color={category.color} height={6} />
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        <View style={styles.section}>
          <SectionHeader
            title="Recently generated"
            actionLabel={recentReports.length > 0 ? 'See all' : undefined}
            onAction={() => router.push('/profile/reports/history')}
          />
          {recentReports.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No reports yet"
              message="Generate your first report to see it here."
              actionLabel="Generate report"
              onAction={() => router.push('/profile/reports/new')}
            />
          ) : (
            <View style={{ gap: Spacing.two }}>
              {recentReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onPress={() =>
                    router.push({ pathname: '/profile/reports/[id]', params: { id: String(report.id) } })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Fab onPress={() => router.push('/profile/reports/new')} />
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
  quickLinks: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  quickLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  card: {
    gap: Spacing.two,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    gap: Spacing.two,
  },
});
