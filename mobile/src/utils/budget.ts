import type { Budget, BudgetPeriod } from '@/types/budget';

export type BudgetStatusLevel = 'safe' | 'warning' | 'critical' | 'exceeded';

// Mirrors the thresholds BudgetViewSet.summary() uses server-side to bucket
// budgets into status_breakdown, so per-card badges agree with the overview counts.
export function getBudgetStatusLevel(percentageUsed: number): BudgetStatusLevel {
  if (percentageUsed >= 100) return 'exceeded';
  if (percentageUsed >= 80) return 'critical';
  if (percentageUsed >= 50) return 'warning';
  return 'safe';
}

export const BUDGET_STATUS_LABEL: Record<BudgetStatusLevel, string> = {
  safe: 'Safe',
  warning: 'Warning',
  critical: 'Critical',
  exceeded: 'Exceeded',
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function periodLengthEnd(start: Date, period: BudgetPeriod): Date {
  switch (period) {
    case 'daily':
      return start;
    case 'weekly':
      return addDays(start, 6);
    case 'monthly':
      return endOfMonth(start);
    case 'quarterly':
      return addDays(new Date(start.getFullYear(), start.getMonth() + 3, start.getDate()), -1);
    case 'yearly':
      return addDays(new Date(start.getFullYear() + 1, start.getMonth(), start.getDate()), -1);
  }
}

// start_date/end_date arrive as "YYYY-MM-DD"; parsing with a T00:00:00 suffix
// keeps this in the local timezone instead of UTC midnight (which `new Date(str)`
// would otherwise use, shifting the displayed day backward in negative-UTC zones).
function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

// For display (e.g. "days remaining"): the period's actual end date, even if
// that's in the future - end of this month, end of this week, etc.
export function getBudgetEndDate(budget: Pick<Budget, 'start_date' | 'end_date' | 'period'>): Date {
  if (budget.end_date) return parseLocalDate(budget.end_date);
  return periodLengthEnd(parseLocalDate(budget.start_date), budget.period);
}

// For matching what the backend actually counted into spent_amount: Budget.update_spent_amount()
// sums expenses through `end_date or today` (not the period's computed end), so an ongoing
// monthly budget's "recent expenses" list should stop at today, not end-of-month.
export function getBudgetSpentWindowEnd(budget: Pick<Budget, 'end_date'>): Date {
  return budget.end_date ? parseLocalDate(budget.end_date) : new Date();
}

// Null once the period has already ended, since "days remaining" doesn't apply.
export function getBudgetDaysRemaining(
  budget: Pick<Budget, 'start_date' | 'end_date' | 'period'>
): number | null {
  const end = getBudgetEndDate(budget);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffDays = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  return diffDays >= 0 ? diffDays : null;
}
