import { z } from 'zod';

import type { Category } from '@/types/category';
import { dateSchema } from '@/types/expense';

export interface BudgetSummaryResponse {
  total_budget: string;
  total_spent: string;
  remaining_total: string;
  budgets_count: number;
  status_breakdown: {
    on_track: number;
    warning: number;
    critical: number;
    exceeded: number;
  };
}

export type BudgetStatus = 'none' | 'good' | 'warning' | 'exceeded';

export interface BudgetOverview {
  totalBudget: number;
  totalSpent: number;
  remainingTotal: number;
  budgetsCount: number;
  percentageUsed: number;
  status: BudgetStatus;
}

export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export const BUDGET_PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

// The API's own `status` field only distinguishes 3 tiers (good/warning/exceeded,
// relative to each budget's own alert_threshold). The UI needs a 4th "critical"
// tier, so BudgetStatusLevel below is computed client-side instead.
export type BudgetApiStatus = 'good' | 'warning' | 'exceeded';

export interface Budget {
  id: number;
  amount: string;
  period: BudgetPeriod;
  start_date: string;
  end_date: string | null;
  spent_amount: string;
  remaining_amount: string;
  percentage_used: number;
  percentage_used_display: string;
  status: BudgetApiStatus;
  alert_threshold: number;
  is_alert_sent: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user: number;
  category: number;
  category_name: string;
  category_details: Category;
}

export interface BudgetListParams {
  search?: string;
  category?: number;
  period?: BudgetPeriod;
  is_active?: boolean;
}

export interface BudgetAlert {
  id: number;
  alert_type: 'threshold' | 'exceeded' | 'near_limit';
  message: string;
  sent_at: string;
  is_read: boolean;
  budget: number;
  budget_category: string;
  budget_amount: string;
}

export const budgetFormSchema = z
  .object({
    category: z.number().min(1, 'Pick a category'),
    amount: z
      .string()
      .min(1, 'Amount is required')
      .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')
      .refine((value) => Number(value) > 0, 'Amount must be greater than 0'),
    period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
    start_date: dateSchema,
    end_date: z.union([dateSchema, z.literal('')]),
    alert_threshold: z
      .string()
      .min(1, 'Alert threshold is required')
      .regex(/^\d+$/, 'Whole numbers only')
      .refine((value) => Number(value) >= 1 && Number(value) <= 100, 'Must be between 1 and 100'),
  })
  .refine((data) => !data.end_date || data.end_date > data.start_date, {
    message: 'End date must be after start date',
    path: ['end_date'],
  });

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
