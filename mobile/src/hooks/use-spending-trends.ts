import { useQuery } from '@tanstack/react-query';

import { fetchExpenseSummary } from '@/services/expenses';
import {
  buildTrendWindows,
  getAverageDailySpending,
  getHighestBucket,
  getLowestBucket,
  getTrendDirection,
  type TrendGranularity,
} from '@/utils/analytics';
import { toISODateString } from '@/utils/format';

export function useSpendingTrends(granularity: TrendGranularity) {
  const windows = buildTrendWindows(granularity);

  return useQuery({
    queryKey: ['analytics', 'trends', granularity, windows.map((w) => w.key)],
    staleTime: 60_000,
    queryFn: async () => {
      const summaries = await Promise.all(
        windows.map((window) =>
          fetchExpenseSummary({
            start_date: toISODateString(window.start),
            end_date: toISODateString(window.end),
          })
        )
      );

      const buckets = windows.map((window, index) => ({
        ...window,
        total: Number(summaries[index].total_amount),
      }));

      const totalSpent = buckets.reduce((sum, bucket) => sum + bucket.total, 0);
      const firstStart = windows[0].start;
      const lastEnd = windows[windows.length - 1].end;
      const totalDays = Math.round((lastEnd.getTime() - firstStart.getTime()) / 86_400_000) + 1;

      return {
        buckets,
        highest: getHighestBucket(buckets),
        lowest: getLowestBucket(buckets),
        averageDaily: getAverageDailySpending(totalSpent, totalDays),
        trend: getTrendDirection(buckets),
      };
    },
  });
}
