import { useQuery } from '@tanstack/react-query';

import { fetchReportViewData } from '@/services/reports';
import type { Report } from '@/types/reports';

export function useReportViewData(report: Report | undefined) {
  return useQuery({
    queryKey: ['reports', 'view-data', report?.id],
    queryFn: () => fetchReportViewData(report!),
    enabled: !!report,
  });
}
