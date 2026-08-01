import { useQuery } from '@tanstack/react-query';

import { fetchExpenseCategories } from '@/services/categories';

export function useExpenseCategories() {
  return useQuery({
    queryKey: ['categories', 'expense'],
    queryFn: fetchExpenseCategories,
    staleTime: 5 * 60_000,
  });
}
