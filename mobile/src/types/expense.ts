import { z } from 'zod';

import type { Category } from '@/types/category';

export type PaymentStatus = 'pending' | 'completed' | 'cancelled';

export interface Expense {
  id: number;
  amount: string;
  description: string;
  date: string;
  payment_status: PaymentStatus;
  location: string;
  notes: string;
  is_group_expense: boolean;
  is_anomaly: boolean;
  anomaly_score: number | null;
  anomaly_reason: string;
  receipt_image: string | null;
  receipt_data_dict: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  category: number | null;
  category_name: string | null;
  category_details: Category | null;
  payment_method: number | null;
  payment_method_name: string | null;
  group: number | null;
}

export interface ExpenseListParams {
  search?: string;
  category?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
}

// Mirrors Expense.summary()'s raw Django ORM `.values()` field names verbatim -
// kept isolated to this boundary; hooks translate it into CategorySpend below.
export interface RawCategoryBreakdownItem {
  category__id: number | null;
  category__name: string | null;
  category__color: string | null;
  total: string;
  count: number;
}

export interface ExpenseSummaryResponse {
  total_amount: string;
  expense_count: number;
  average_amount: string;
  category_breakdown: RawCategoryBreakdownItem[];
  daily_totals: { date: string; daily_total: string }[];
}

export interface CategorySpend {
  id: number | null;
  name: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Enter a valid date');

export const expenseFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')
    .refine((value) => Number(value) > 0, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(255),
  date: dateSchema,
  category: z.number().nullable(),
  payment_method: z.number().nullable(),
  payment_status: z.enum(['pending', 'completed', 'cancelled']),
  location: z.string().max(255).optional(),
  notes: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
