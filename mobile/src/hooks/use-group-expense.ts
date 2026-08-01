import { useQuery } from '@tanstack/react-query';

import { fetchGroupExpense } from '@/services/groups';

export function useGroupExpense(id: number) {
  return useQuery({
    queryKey: ['group-expenses', 'detail', id],
    queryFn: () => fetchGroupExpense(id),
    enabled: Number.isFinite(id),
  });
}
