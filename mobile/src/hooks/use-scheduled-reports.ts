import { useQuery } from '@tanstack/react-query';

import { fetchScheduledReports } from '@/services/reports';

export function useScheduledReports() {
  return useQuery({
    queryKey: ['reports', 'scheduled', 'list'],
    queryFn: fetchScheduledReports,
  });
}
