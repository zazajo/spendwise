import { useQuery } from '@tanstack/react-query';

import { fetchScheduledReport } from '@/services/reports';

export function useScheduledReport(id: number) {
  return useQuery({
    queryKey: ['reports', 'scheduled', 'detail', id],
    queryFn: () => fetchScheduledReport(id),
    enabled: Number.isFinite(id),
  });
}
