import { useQuery } from '@tanstack/react-query';

import { fetchMonthlySummary } from '@/services/reports';

export function useMonthlySummaryReport() {
  return useQuery({
    queryKey: ['reports', 'monthly-summary'],
    queryFn: () => fetchMonthlySummary(),
  });
}
