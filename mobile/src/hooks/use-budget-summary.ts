import { useQuery } from '@tanstack/react-query';

import { fetchBudgetSummary } from '@/services/budgets';
import type { BudgetOverview } from '@/types/budget';

export function useBudgetSummary() {
  return useQuery({
    queryKey: ['budgets', 'summary'],
    queryFn: fetchBudgetSummary,
    select: (data): BudgetOverview => {
      const totalBudget = Number(data.total_budget);
      const totalSpent = Number(data.total_spent);
      const remainingTotal = Number(data.remaining_total);
      const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
      const status: BudgetOverview['status'] =
        data.budgets_count === 0
          ? 'none'
          : percentageUsed >= 100
            ? 'exceeded'
            : percentageUsed >= 75
              ? 'warning'
              : 'good';

      return {
        totalBudget,
        totalSpent,
        remainingTotal,
        budgetsCount: data.budgets_count,
        percentageUsed,
        status,
      };
    },
  });
}
