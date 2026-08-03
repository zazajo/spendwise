import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { TrendBarChart } from '@/components/analytics/trend-bar-chart';
import { TrendIndicator } from '@/components/analytics/trend-indicator';
import { SectionHeader } from '@/components/section-header';
import { useSpendingTrends } from '@/hooks/use-spending-trends';
import { formatCurrency } from '@/utils/format';

type ReportTrendsSummaryCardProps = {
  currency: string;
  onSeeAll: () => void;
};

// Reuses the existing analytics trends hook/components as-is (from the Milestone 7
// analytics feature) rather than building a new trends endpoint - this is purely a
// compact preview; the full interactive view already lives at /analytics/trends.
export function ReportTrendsSummaryCard({ currency, onSeeAll }: ReportTrendsSummaryCardProps) {
  const { data, isLoading, isError } = useSpendingTrends('monthly');

  if (isLoading || isError || !data) {
    return null;
  }

  if (data.buckets.every((bucket) => bucket.total === 0)) {
    return (
      <Card>
        <SectionHeader title="Spending trends" actionLabel="See all" onAction={onSeeAll} />
        <EmptyState icon="trending-up-outline" title="No spending data yet" />
      </Card>
    );
  }

  return (
    <Card>
      <SectionHeader title="Spending trends" actionLabel="See all" onAction={onSeeAll} />
      <TrendIndicator
        direction={data.trend}
        label={`Averaging ${formatCurrency(data.averageDaily, currency)}/day`}
        invertColor={false}
      />
      <TrendBarChart buckets={data.buckets} currency={currency} height={100} />
    </Card>
  );
}
