import { useQuery } from '@tanstack/react-query';

import { fetchBudget } from '@/services/budgets';

export function useBudget(id: number) {
  return useQuery({
    queryKey: ['budgets', 'detail', id],
    queryFn: () => fetchBudget(id),
    enabled: Number.isFinite(id),
  });
}
