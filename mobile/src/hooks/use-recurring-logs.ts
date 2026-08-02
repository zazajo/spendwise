import { useQuery } from '@tanstack/react-query';

import { fetchRecurringLogs } from '@/services/recurring';

export function useRecurringLogs() {
  return useQuery({
    queryKey: ['recurring', 'logs'],
    queryFn: fetchRecurringLogs,
  });
}
