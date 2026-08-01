import { useQuery } from '@tanstack/react-query';

import { fetchExpenses } from '@/services/expenses';

export function useRecentExpenses(limit = 5) {
  return useQuery({
    queryKey: ['expenses', 'recent', limit],
    queryFn: () => fetchExpenses({}),
    select: (data) => data.results.slice(0, limit),
  });
}
