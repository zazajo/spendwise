import { useQuery } from '@tanstack/react-query';

import { fetchBudgetVarianceSummary } from '@/services/reports';

export function useBudgetVarianceReport() {
  return useQuery({
    queryKey: ['reports', 'budget-variance'],
    queryFn: () => fetchBudgetVarianceSummary(),
  });
}
