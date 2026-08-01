import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createDefaultAnomalyRule } from '@/services/analytics';

export function useEnableAnomalyDetection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDefaultAnomalyRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'anomaly-rules'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'anomalies'] });
    },
  });
}
