import { useQuery } from '@tanstack/react-query';

import { fetchAnomalies } from '@/services/analytics';

export function useAnomalies() {
  return useQuery({
    queryKey: ['analytics', 'anomalies'],
    queryFn: fetchAnomalies,
  });
}
