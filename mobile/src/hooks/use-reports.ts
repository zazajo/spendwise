import { useQuery } from '@tanstack/react-query';

import { fetchReports } from '@/services/reports';
import type { ReportListParams } from '@/types/report';

export function useReports(params: ReportListParams = {}) {
  return useQuery({
    queryKey: ['reports', 'list', params],
    queryFn: () => fetchReports(params),
  });
}
