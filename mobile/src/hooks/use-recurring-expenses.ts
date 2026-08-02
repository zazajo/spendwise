import { useQuery } from '@tanstack/react-query';

import { fetchRecurringExpenses } from '@/services/recurring';
import type { RecurringListParams } from '@/types/recurring';

export function useRecurringExpenses(params: RecurringListParams) {
  return useQuery({
    queryKey: ['recurring', 'list', params],
    queryFn: () => fetchRecurringExpenses(params),
  });
}
