import { useQuery } from '@tanstack/react-query';

import { fetchExpenseSummary } from '@/services/expenses';
import type { CategorySpend } from '@/types/expense';
import { mapCategoryBreakdown } from '@/utils/expense';
import { toISODateString } from '@/utils/format';

export interface CategoryAnalysis {
  totalAmount: number;
  categories: CategorySpend[];
  highest: CategorySpend | null;
  lowest: CategorySpend | null;
}

function monthBounds(monthDate: Date) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  return { start: toISODateString(start), end: toISODateString(end) };
}

// Deliberately built on /expenses/summary/ (already used elsewhere) rather than the
// analytics category_analysis action, which 500s for explicit year/month on any
// month shorter than 31 days - see services/analytics.ts for details. Since it is
// the same request useExpenseSummary makes, it shares that key and differs only in
// how it reshapes the response.
export function useCategoryAnalysis(monthDate: Date) {
  const { start, end } = monthBounds(monthDate);

  return useQuery({
    queryKey: ['expenses', 'summary', { start_date: start, end_date: end }],
    queryFn: () => fetchExpenseSummary({ start_date: start, end_date: end }),
    select: (data): CategoryAnalysis => {
      const categories = mapCategoryBreakdown(data);
      return {
        totalAmount: Number(data.total_amount),
        categories,
        highest: categories[0] ?? null,
        lowest: categories.length > 0 ? categories[categories.length - 1] : null,
      };
    },
  });
}
