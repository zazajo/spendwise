import type { AnomalySeverity, HealthGrade } from '@/types/analytics';

export type TrendGranularity = 'weekly' | 'monthly' | 'yearly';

export interface TrendBucket {
  key: string;
  label: string;
  total: number;
  start: Date;
  end: Date;
}

const BUCKET_COUNT: Record<TrendGranularity, number> = {
  weekly: 8,
  monthly: 6,
  yearly: 4,
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday-start week
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

const SHORT_DATE = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const SHORT_MONTH = new Intl.DateTimeFormat(undefined, { month: 'short' });

// Pure date math - the actual totals are filled in separately (see hooks/use-spending-trends.ts),
// since /expenses/summary/'s daily_totals field ignores its start_date/end_date params and
// always covers only the current calendar month server-side, making it useless for arbitrary
// lookback windows. Instead each window's total is fetched via its own summary call, reading
// total_amount (which does respect the date range) rather than daily_totals.
export function buildTrendWindows(granularity: TrendGranularity): Omit<TrendBucket, 'total'>[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = BUCKET_COUNT[granularity];
  const windows: Omit<TrendBucket, 'total'>[] = [];

  for (let i = count - 1; i >= 0; i--) {
    let start: Date;
    let end: Date;
    let label: string;
    let key: string;

    if (granularity === 'weekly') {
      start = addDays(startOfWeek(today), -7 * i);
      end = addDays(start, 6);
      label = `${SHORT_DATE.format(start)}–${SHORT_DATE.format(end)}`;
      key = start.toISOString();
    } else if (granularity === 'monthly') {
      const base = new Date(today.getFullYear(), today.getMonth() - i, 1);
      start = base;
      end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      label = SHORT_MONTH.format(base);
      key = `${base.getFullYear()}-${base.getMonth()}`;
    } else {
      const year = today.getFullYear() - i;
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
      label = String(year);
      key = label;
    }

    windows.push({ key, label, start, end });
  }

  return windows;
}

export function getHighestBucket(buckets: TrendBucket[]): TrendBucket | null {
  if (buckets.length === 0) return null;
  return buckets.reduce((max, bucket) => (bucket.total > max.total ? bucket : max));
}

// Excludes zero-spend buckets - a period with no data isn't a meaningful "lowest".
export function getLowestBucket(buckets: TrendBucket[]): TrendBucket | null {
  const spent = buckets.filter((bucket) => bucket.total > 0);
  if (spent.length === 0) return null;
  return spent.reduce((min, bucket) => (bucket.total < min.total ? bucket : min));
}

export function getAverageDailySpending(totalSpent: number, days: number): number {
  if (days <= 0) return 0;
  return totalSpent / days;
}

export type TrendDirection = 'up' | 'down' | 'stable';

// Compares the two most recent *completed-or-current* buckets in the series.
export function getTrendDirection(buckets: TrendBucket[]): TrendDirection {
  if (buckets.length < 2) return 'stable';
  const [previous, current] = buckets.slice(-2);
  if (previous.total === 0) return current.total > 0 ? 'up' : 'stable';
  const change = (current.total - previous.total) / previous.total;
  if (change > 0.05) return 'up';
  if (change < -0.05) return 'down';
  return 'stable';
}

export const SEVERITY_LABEL: Record<AnomalySeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const SEVERITY_COLOR_KEY: Record<AnomalySeverity, 'primary' | 'warning' | 'danger'> = {
  low: 'primary',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

export const GRADE_COLOR_KEY: Record<HealthGrade, 'success' | 'warning' | 'danger'> = {
  A: 'success',
  B: 'success',
  C: 'warning',
  D: 'danger',
  F: 'danger',
};
