import { useQuery } from '@tanstack/react-query';

import { fetchRecurringExpense } from '@/services/recurring';

export function useRecurringExpense(id: number) {
  return useQuery({
    queryKey: ['recurring', 'detail', id],
    queryFn: () => fetchRecurringExpense(id),
    enabled: Number.isFinite(id),
  });
}
