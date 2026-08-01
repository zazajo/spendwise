import { useQuery } from '@tanstack/react-query';

import { fetchExpenses } from '@/services/expenses';
import type { Budget } from '@/types/budget';
import { getBudgetSpentWindowEnd } from '@/utils/budget';
import { toISODateString } from '@/utils/format';

export function useBudgetExpenses(budget: Budget | undefined, limit = 5) {
  return useQuery({
    queryKey: ['expenses', 'by-budget', budget?.id, limit],
    queryFn: () => {
      if (!budget) throw new Error('Budget is required');
      return fetchExpenses({
        category: budget.category,
        start_date: budget.start_date,
        end_date: toISODateString(getBudgetSpentWindowEnd(budget)),
      });
    },
    enabled: Boolean(budget),
    select: (data) => data.results.slice(0, limit),
  });
}
