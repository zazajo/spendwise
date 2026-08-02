import { z } from 'zod';

import { dateSchema } from '@/types/expense';
import type { Expense } from '@/types/expense';

export type RecurringFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

export const RECURRING_FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

export interface RecurringExpense {
  id: number;
  amount: string;
  description: string;
  notes: string;
  frequency: RecurringFrequency;
  interval: number;
  start_date: string;
  end_date: string | null;
  next_occurrence: string;
  next_occurrence_display: string;
  last_occurrence: string | null;
  is_active: boolean;
  auto_create: boolean;
  user: number;
  category: number;
  category_name: string;
  payment_method: number | null;
  payment_method_name: string | null;
  created_at: string;
  updated_at: string;
}

// The API only exposes is_active - "completed" (ran its course vs. was
// manually paused) is derived client-side from end_date/next_occurrence.
export type RecurringLifecycleStatus = 'active' | 'paused' | 'completed';

export function getRecurringLifecycleStatus(
  recurring: Pick<RecurringExpense, 'is_active' | 'end_date' | 'next_occurrence'>
): RecurringLifecycleStatus {
  if (recurring.is_active) return 'active';
  if (recurring.end_date && recurring.next_occurrence > recurring.end_date) return 'completed';
  return 'paused';
}

export type RecurringSortKey = 'next_occurrence' | 'amount' | '-created_at';

export interface RecurringListParams {
  search?: string;
  category?: number;
  payment_method?: number;
  frequency?: RecurringFrequency;
  is_active?: boolean;
  ordering?: RecurringSortKey;
}

export type RecurringLogStatus = 'created' | 'skipped' | 'failed';

export interface RecurringLog {
  id: number;
  scheduled_date: string;
  processed_date: string;
  status: RecurringLogStatus;
  error_message: string;
  recurring_expense: number;
  recurring_expense_details: RecurringExpense;
  expense: number | null;
  expense_details: Expense | null;
}

export interface RecurringUpcomingDate {
  date: string;
  amount: string;
  description: string;
  days_until: number;
}

export interface RecurringUpcomingResponse {
  recurring_expense_id: number;
  description: string;
  amount: string;
  frequency: RecurringFrequency;
  upcoming_count: number;
  upcoming_dates: RecurringUpcomingDate[];
}

export interface RecurringDashboardResponse {
  summary: {
    total_active: number;
    total_inactive: number;
    estimated_monthly_total: number;
    upcoming_this_month_count: number;
    overdue_count: number;
  };
  upcoming_this_month: RecurringExpense[];
  overdue: RecurringExpense[];
}

export interface RecurringGenerateResponse {
  message: string;
  expense: Expense;
  next_occurrence: string;
}

export interface RecurringGenerateBatchResponse {
  message: string;
  generated_count: number;
  generated: Expense[];
  errors: { id: number; description: string; error: string }[] | null;
}

export const recurringFormSchema = z
  .object({
    description: z.string().min(1, 'Name is required').max(255),
    amount: z
      .string()
      .min(1, 'Amount is required')
      .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')
      .refine((value) => Number(value) > 0, 'Amount must be greater than 0'),
    category: z.number().min(1, 'Pick a category'),
    payment_method: z.number().nullable(),
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom']),
    interval: z
      .string()
      .min(1, 'Interval is required')
      .regex(/^\d+$/, 'Whole numbers only')
      .refine((value) => Number(value) >= 1, 'Must be at least 1'),
    start_date: dateSchema,
    end_date: z.union([dateSchema, z.literal('')]),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => !data.end_date || data.end_date > data.start_date, {
    message: 'End date must be after start date',
    path: ['end_date'],
  });

export type RecurringFormValues = z.infer<typeof recurringFormSchema>;
