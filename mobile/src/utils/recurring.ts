import { RECURRING_FREQUENCIES, type RecurringFrequency, type RecurringLifecycleStatus } from '@/types/recurring';

export const RECURRING_STATUS_LABEL: Record<RecurringLifecycleStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
};

export function getFrequencyLabel(frequency: RecurringFrequency): string {
  return RECURRING_FREQUENCIES.find((option) => option.value === frequency)?.label ?? frequency;
}

// "Weekly" for interval 1, "Every 2 weeks" for interval 2+, matching how the
// backend's calculate_next_date() actually applies `interval` as a multiplier.
export function getIntervalLabel(frequency: RecurringFrequency, interval: number): string {
  if (interval <= 1) return getFrequencyLabel(frequency);

  const unit: Record<RecurringFrequency, string> = {
    daily: 'days',
    weekly: 'weeks',
    biweekly: 'fortnights',
    monthly: 'months',
    quarterly: 'quarters',
    yearly: 'years',
    custom: `× ${getFrequencyLabel(frequency).toLowerCase()}`,
  };

  return `Every ${interval} ${unit[frequency]}`;
}

// start_date/next_occurrence arrive as "YYYY-MM-DD"; parsing with a T00:00:00
// suffix keeps this in the local timezone instead of shifting a day in
// negative-UTC zones, matching the same fix already used in utils/budget.ts.
function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function daysUntil(dateStr: string, from: Date = new Date()): number {
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  const target = parseLocalDate(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export type RecurringDueUrgency = 'overdue' | 'due-soon' | 'upcoming';

const DUE_SOON_WINDOW_DAYS = 3;

export function getDueUrgency(nextOccurrence: string): RecurringDueUrgency {
  const diff = daysUntil(nextOccurrence);
  if (diff < 0) return 'overdue';
  if (diff <= DUE_SOON_WINDOW_DAYS) return 'due-soon';
  return 'upcoming';
}
