import { useQuery } from '@tanstack/react-query';

import { fetchExpenses } from '@/services/expenses';

export function useCategoryExpenses(categoryId: number, limit = 5) {
  return useQuery({
    queryKey: ['expenses', 'by-category', categoryId, limit],
    queryFn: () => fetchExpenses({ category: categoryId }),
    enabled: Number.isFinite(categoryId),
    select: (data) => data.results.slice(0, limit),
  });
}
