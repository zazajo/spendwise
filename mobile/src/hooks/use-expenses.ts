import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchExpenses } from '@/services/expenses';
import type { ExpenseListParams } from '@/types/expense';

export function useExpenses(filters: Omit<ExpenseListParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['expenses', 'list', filters],
    queryFn: ({ pageParam }) => fetchExpenses({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
  });
}
