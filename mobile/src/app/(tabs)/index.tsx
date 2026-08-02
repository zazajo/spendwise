import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetProgressCard } from '@/components/dashboard/budget-progress-card';
import { CategoryBreakdownSection } from '@/components/dashboard/category-breakdown-section';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { GreetingHeader } from '@/components/dashboard/greeting-header';
import { GroupsSummaryCard } from '@/components/dashboard/groups-summary-card';
import { MonthSummaryCard } from '@/components/dashboard/month-summary-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentExpensesSection } from '@/components/dashboard/recent-expenses-section';
import { RecurringUpcomingCard } from '@/components/dashboard/recurring-upcoming-card';
import { ErrorState } from '@/components/error-state';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useDashboard } from '@/hooks/use-dashboard';

const EMPTY_MONTH_SUMMARY = { totalAmount: 0, expenseCount: 0, categories: [] };
const EMPTY_BUDGET_OVERVIEW = {
  totalBudget: 0,
  totalSpent: 0,
  remainingTotal: 0,
  budgetsCount: 0,
  percentageUsed: 0,
  status: 'none' as const,
};

export default function HomeScreen() {
  const {
    user,
    currency,
    greeting,
    monthSummary,
    recentExpenses,
    budgetOverview,
    groups,
    recurringUpcoming,
    isLoading,
    isError,
    isRefetching,
    refetchAll,
  } = useDashboard();

  const name = user?.first_name || user?.username || '';
  const monthData = monthSummary ?? EMPTY_MONTH_SUMMARY;
  const budgetData = budgetOverview ?? EMPTY_BUDGET_OVERVIEW;

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.content}>
            <DashboardSkeleton />
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ErrorState message="Couldn't load your dashboard." onRetry={refetchAll} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}>
          <GreetingHeader name={name} greeting={greeting} />

          <MonthSummaryCard
            totalAmount={monthData.totalAmount}
            currency={currency}
            expenseCount={monthData.expenseCount}
          />

          <BudgetProgressCard
            overview={budgetData}
            currency={currency}
            onSetBudget={() => router.push('/budgets')}
          />

          <QuickActions
            actions={[
              {
                key: 'add',
                label: 'Add Expense',
                icon: 'add-circle-outline',
                onPress: () => router.push('/expenses/new'),
              },
              {
                key: 'all',
                label: 'All Expenses',
                icon: 'list-outline',
                onPress: () => router.push('/expenses'),
              },
              {
                key: 'budgets',
                label: 'Budgets',
                icon: 'wallet-outline',
                onPress: () => router.push('/budgets'),
              },
              {
                key: 'recurring',
                label: 'Recurring',
                icon: 'repeat-outline',
                onPress: () => router.push('/profile/recurring'),
              },
            ]}
          />

          <GroupsSummaryCard groups={groups} onPress={() => router.push('/groups')} />

          <RecurringUpcomingCard
            items={recurringUpcoming}
            currency={currency}
            onPress={() => router.push('/profile/recurring')}
          />

          <RecentExpensesSection
            expenses={recentExpenses}
            currency={currency}
            onPressExpense={(id) =>
              router.push({ pathname: '/expenses/[id]', params: { id: String(id) } })
            }
            onSeeAll={() => router.push('/expenses')}
            onAddExpense={() => router.push('/expenses/new')}
          />

          <CategoryBreakdownSection categories={monthData.categories} currency={currency} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: BottomTabInset + Spacing.four,
  },
});
