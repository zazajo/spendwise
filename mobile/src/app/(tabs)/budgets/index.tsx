import { router } from 'expo-router';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { BudgetAlertItem } from '@/components/budget-alert-item';
import { BudgetCard } from '@/components/budget-card';
import { BudgetListSkeleton } from '@/components/budget-list-skeleton';
import { BudgetProgressCard } from '@/components/dashboard/budget-progress-card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { Fab } from '@/components/fab';
import { SectionHeader } from '@/components/section-header';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useBudgetAlerts } from '@/hooks/use-budget-alerts';
import { useBudgetSummary } from '@/hooks/use-budget-summary';
import { useBudgets } from '@/hooks/use-budgets';
import { useMarkAlertRead, useMarkAllAlertsRead } from '@/hooks/use-mark-alert-read';
import type { BudgetOverview } from '@/types/budget';

const EMPTY_BUDGET_OVERVIEW: BudgetOverview = {
  totalBudget: 0,
  totalSpent: 0,
  remainingTotal: 0,
  budgetsCount: 0,
  percentageUsed: 0,
  status: 'none',
};

export default function BudgetsOverviewScreen() {

  const summary = useBudgetSummary();
  const budgets = useBudgets({ is_active: true });
  const alertLog = useBudgetAlerts();
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();

  const isLoading = summary.isLoading || budgets.isLoading;
  const isError = summary.isError || budgets.isError;
  const isRefetching = summary.isRefetching || budgets.isRefetching || alertLog.isRefetching;

  const refetchAll = useCallback(() => {
    return Promise.all([summary.refetch(), budgets.refetch(), alertLog.refetch()]);
  }, [summary, budgets, alertLog]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <BudgetListSkeleton />
        </ScrollView>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <ErrorState message="Couldn't load your budgets." onRetry={refetchAll} />
      </ThemedView>
    );
  }

  const budgetList = budgets.data ?? [];
  const alerts = alertLog.data ?? [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}>
        <BudgetProgressCard
          overview={summary.data ?? EMPTY_BUDGET_OVERVIEW}
          onSetBudget={() => router.push('/budgets/new')}
          emptyActionLabel="Create budget"
        />

        {alerts.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Alerts"
              actionLabel="Mark all read"
              onAction={() => markAllRead.mutate()}
            />
            <View style={{ gap: Spacing.two }}>
              {alerts.map((alert) => (
                <BudgetAlertItem
                  key={alert.id}
                  alert={alert}
                  onMarkRead={() => markRead.mutate(alert.id)}
                  isMarkingRead={markRead.isPending}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="Your budgets" />
          {budgetList.length === 0 ? (
            <EmptyState
              icon="wallet-outline"
              title="No budgets yet"
              message="Create a budget to start tracking spending by category."
              actionLabel="Create budget"
              onAction={() => router.push('/budgets/new')}
            />
          ) : (
            <View style={{ gap: Spacing.three }}>
              {budgetList.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onPress={() =>
                    router.push({ pathname: '/budgets/[id]', params: { id: String(budget.id) } })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Fab onPress={() => router.push('/budgets/new')} />
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
});
