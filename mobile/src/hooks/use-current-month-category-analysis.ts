import { useQuery } from '@tanstack/react-query';

import { fetchCurrentMonthCategoryAnalysis } from '@/services/analytics';
import type { CategorySpend } from '@/types/expense';

export function useCurrentMonthCategoryAnalysis() {
  return useQuery({
    queryKey: ['analytics', 'category-analysis', 'current-month'],
    queryFn: fetchCurrentMonthCategoryAnalysis,
    select: (data): CategorySpend[] =>
      data.categories.map((item) => ({
        id: item.category__id,
        name: item.category__name ?? 'Uncategorized',
        color: item.category__color ?? '#9AA0A6',
        total: item.total,
        count: item.count,
        percentage: item.percentage,
      })),
  });
}
