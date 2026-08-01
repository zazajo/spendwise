import { useQuery } from '@tanstack/react-query';

import { fetchExpenseSummary } from '@/services/expenses';
import type { CategorySpend } from '@/types/expense';
import { mapCategoryBreakdown } from '@/utils/expense';

export interface MonthExpenseSummary {
  totalAmount: number;
  expenseCount: number;
  categories: CategorySpend[];
}

export function useExpenseSummary(params: { start_date: string; end_date: string }) {
  return useQuery({
    queryKey: ['expenses', 'summary', params],
    queryFn: () => fetchExpenseSummary(params),
    select: (data): MonthExpenseSummary => ({
      totalAmount: Number(data.total_amount),
      expenseCount: data.expense_count,
      categories: mapCategoryBreakdown(data),
    }),
  });
}
