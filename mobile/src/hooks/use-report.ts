import { useQuery } from '@tanstack/react-query';

import { fetchReport } from '@/services/reports';

export function useReport(id: number) {
  return useQuery({
    queryKey: ['reports', 'detail', id],
    queryFn: () => fetchReport(id),
    enabled: Number.isFinite(id),
  });
}
