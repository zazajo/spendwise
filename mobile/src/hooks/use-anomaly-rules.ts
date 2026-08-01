import { useQuery } from '@tanstack/react-query';

import { fetchAnomalyRules } from '@/services/analytics';

export function useAnomalyRules() {
  return useQuery({
    queryKey: ['analytics', 'anomaly-rules'],
    queryFn: fetchAnomalyRules,
  });
}
