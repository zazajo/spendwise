import { useQuery } from '@tanstack/react-query';

import { fetchRecurringUpcoming } from '@/services/recurring';

export function useRecurringUpcoming(id: number, count = 5) {
  return useQuery({
    queryKey: ['recurring', 'upcoming', id, count],
    queryFn: () => fetchRecurringUpcoming(id, count),
    enabled: Number.isFinite(id),
  });
}
