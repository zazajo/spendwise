import { useQuery } from '@tanstack/react-query';

import { fetchRecurringDashboard } from '@/services/recurring';

export function useRecurringDashboard() {
  return useQuery({
    queryKey: ['recurring', 'dashboard'],
    queryFn: fetchRecurringDashboard,
  });
}
