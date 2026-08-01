import { useQuery } from '@tanstack/react-query';

import { fetchAnalyticsDashboard } from '@/services/analytics';

export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: fetchAnalyticsDashboard,
    staleTime: 60_000,
  });
}
