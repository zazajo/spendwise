import type { CategorySpend, ExpenseSummaryResponse } from '@/types/expense';

export function mapCategoryBreakdown(data: ExpenseSummaryResponse): CategorySpend[] {
  const totalAmount = Number(data.total_amount);

  return data.category_breakdown
    .map((item) => ({
      id: item.category__id,
      name: item.category__name ?? 'Uncategorized',
      color: item.category__color ?? '#9AA0A6',
      total: Number(item.total),
      count: item.count,
      percentage: totalAmount > 0 ? (Number(item.total) / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}
