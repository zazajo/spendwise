import { useMutation, useQueryClient } from '@tanstack/react-query';

import { refreshHealthScore } from '@/services/analytics';
import type { AnalyticsDashboardResponse } from '@/types/analytics';

export function useRefreshHealthScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refreshHealthScore,
    onSuccess: (metric) => {
      queryClient.setQueryData<AnalyticsDashboardResponse>(['analytics', 'dashboard'], (current) =>
        current ? { ...current, financial_health: metric } : current
      );
      queryClient.invalidateQueries({ queryKey: ['analytics', 'health-history'] });
    },
  });
}
