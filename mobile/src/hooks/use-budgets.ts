import { useQuery } from '@tanstack/react-query';

import { fetchBudgets } from '@/services/budgets';
import type { BudgetListParams } from '@/types/budget';

export function useBudgets(params: BudgetListParams) {
  return useQuery({
    queryKey: ['budgets', 'list', params],
    queryFn: () => fetchBudgets(params),
  });
}
