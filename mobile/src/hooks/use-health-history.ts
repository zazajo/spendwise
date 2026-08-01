import { useQuery } from '@tanstack/react-query';

import { fetchHealthHistory } from '@/services/analytics';

export function useHealthHistory() {
  return useQuery({
    queryKey: ['analytics', 'health-history'],
    queryFn: fetchHealthHistory,
  });
}
