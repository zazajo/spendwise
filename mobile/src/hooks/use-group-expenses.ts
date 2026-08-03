import { useQuery } from '@tanstack/react-query';

import { fetchGroupExpenses } from '@/services/groups';
import type { GroupExpenseListParams } from '@/types/group';

export function useGroupExpenses(params: GroupExpenseListParams) {
  return useQuery({
    queryKey: ['groups', 'expenses', 'list', params],
    queryFn: () => fetchGroupExpenses(params),
  });
}
