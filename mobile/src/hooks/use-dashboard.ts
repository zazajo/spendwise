import { useCallback, useMemo } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { useBudgetSummary } from '@/hooks/use-budget-summary';
import { useExpenseSummary } from '@/hooks/use-expense-summary';
import { useGroups } from '@/hooks/use-groups';
import { useRecentExpenses } from '@/hooks/use-recent-expenses';
import { useRecurringDashboard } from '@/hooks/use-recurring-dashboard';
import { formatGreetingTime, toISODateString } from '@/utils/format';

export function useDashboard() {
  const { user } = useAuth();

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: toISODateString(monthStart), endDate: toISODateString(today) };
  }, []);

  const summary = useExpenseSummary({ start_date: startDate, end_date: endDate });
  const recent = useRecentExpenses(5);
  const budget = useBudgetSummary();
  // Kept out of isLoading/isError below - groups and recurring are supplementary
  // dashboard cards, not core to the personal-finance summary, so a slow/failed
  // fetch for either shouldn't block or error out the rest of the dashboard.
  const groups = useGroups({});
  const recurring = useRecurringDashboard();

  const refetchAll = useCallback(() => {
    return Promise.all([
      summary.refetch(),
      recent.refetch(),
      budget.refetch(),
      groups.refetch(),
      recurring.refetch(),
    ]);
  }, [summary, recent, budget, groups, recurring]);

  return {
    user,
    currency: user?.profile.currency ?? '',
    greeting: formatGreetingTime(),
    monthSummary: summary.data,
    recentExpenses: recent.data ?? [],
    budgetOverview: budget.data,
    groups: groups.data ?? [],
    groupsLoading: groups.isLoading,
    recurringUpcoming: [...(recurring.data?.overdue ?? []), ...(recurring.data?.upcoming_this_month ?? [])]
      .sort((a, b) => a.next_occurrence.localeCompare(b.next_occurrence))
      .slice(0, 3),
    isLoading: summary.isLoading || recent.isLoading || budget.isLoading,
    isError: summary.isError || recent.isError || budget.isError,
    isRefetching: summary.isRefetching || recent.isRefetching || budget.isRefetching,
    refetchAll,
  };
}
