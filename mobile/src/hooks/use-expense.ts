import { useQuery } from '@tanstack/react-query';

import { fetchExpense } from '@/services/expenses';

export function useExpense(id: number) {
  return useQuery({
    queryKey: ['expenses', 'detail', id],
    queryFn: () => fetchExpense(id),
    enabled: Number.isFinite(id),
  });
}
