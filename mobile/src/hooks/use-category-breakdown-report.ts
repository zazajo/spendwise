import { useQuery } from '@tanstack/react-query';

import { fetchCategoryBreakdownSummary } from '@/services/reports';

export function useCategoryBreakdownReport() {
  return useQuery({
    queryKey: ['reports', 'category-breakdown'],
    queryFn: () => fetchCategoryBreakdownSummary(),
  });
}
