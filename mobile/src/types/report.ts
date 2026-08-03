import { z } from 'zod';

import { dateSchema } from '@/types/expense';

// The backend model lists 6 report_type choices, but generate()/download() only
// have working branches for these 3 - expense_summary/trend_analysis return a 400
// ("Unknown report type"), and group_summary crashes with a NameError server-side
// (GroupExpenseSplit is used but never imported in reports/services.py). Only the
// 3 below are exposed anywhere in this app.
export type ReportType = 'monthly_summary' | 'category_analysis' | 'budget_variance';

export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  monthly_summary: 'Monthly Summary',
  category_analysis: 'Category Breakdown',
  budget_variance: 'Budget vs Actual',
};

// 'pdf' is a listed FORMAT_CHOICES value, but generate()/download() only special-case
// 'csv' - anything else (including 'pdf') just returns plain JSON silently mislabeled.
// Only the two formats that actually behave differently are exposed.
export type ReportFormat = 'json' | 'csv';

export interface Report {
  id: number;
  name: string;
  report_type: ReportType;
  format: ReportFormat;
  parameters: Record<string, unknown>;
  file: string | null;
  created_at: string;
  is_generated: boolean;
}

export interface ReportListParams {
  search?: string;
  report_type?: ReportType;
  format?: ReportFormat;
  ordering?: 'created_at' | '-created_at';
}

// --- Per-type report data shapes, mirroring ReportService's return dicts verbatim ---

export interface MonthlySummaryCategoryRow {
  category__name: string | null;
  category__color: string | null;
  total: number;
  count: number;
}

export interface MonthlySummaryData {
  month: string;
  year: number;
  start_date: string;
  end_date: string;
  total_spent: number;
  top_category: string;
  top_category_amount: number;
  category_breakdown: MonthlySummaryCategoryRow[];
  daily_spending: { date: string; daily_total: number }[];
  previous_month_total: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CategoryBreakdownRow {
  category_id: number;
  category_name: string;
  color: string;
  total: number;
  percentage: number;
  transaction_count: number;
  average_amount: number;
}

export interface CategoryBreakdownData {
  period: { start_date: string; end_date: string };
  total_expenses: number;
  total_transactions: number;
  categories: CategoryBreakdownRow[];
}

export interface BudgetVarianceRow {
  category_id: number;
  category_name: string;
  budget_amount: number;
  actual_amount: number;
  variance: number;
  variance_percentage: number;
  status: 'under' | 'over' | 'on_track';
}

export interface BudgetVarianceData {
  period: { year: number; month: number; month_name: string };
  total_budget: number;
  total_actual: number;
  total_variance: number;
  total_variance_percentage: number;
  categories: BudgetVarianceRow[];
}

export type ReportData = MonthlySummaryData | CategoryBreakdownData | BudgetVarianceData;

export interface GenerateReportResponse {
  report_id: number;
  data: ReportData;
  generated_at: string;
}

// --- Scheduled reports ---

export type ScheduledReportFrequency = 'daily' | 'weekly' | 'monthly';

export const SCHEDULED_FREQUENCY_LABEL: Record<ScheduledReportFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export interface ScheduledReport {
  id: number;
  name: string;
  report_type: ReportType;
  format: ReportFormat;
  frequency: ScheduledReportFrequency;
  parameters: Record<string, unknown>;
  last_sent: string | null;
  next_send: string;
  is_active: boolean;
  email: string;
}

export const scheduledReportFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  report_type: z.enum(['monthly_summary', 'category_analysis', 'budget_variance']),
  format: z.enum(['json', 'csv']),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export type ScheduledReportFormValues = z.infer<typeof scheduledReportFormSchema>;

// --- Generate report form ---

const yearRegex = /^\d{4}$/;
const monthRegex = /^(0?[1-9]|1[0-2])$/;

export const generateReportFormSchema = z
  .object({
    report_type: z.enum(['monthly_summary', 'category_analysis', 'budget_variance']),
    name: z.string().min(1, 'Name is required').max(100),
    format: z.enum(['json', 'csv']),
    year: z.string().optional(),
    month: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.report_type === 'monthly_summary' || data.report_type === 'budget_variance') {
      if (!data.year || !yearRegex.test(data.year)) {
        ctx.addIssue({ code: 'custom', message: 'Enter a 4-digit year', path: ['year'] });
      }
      if (!data.month || !monthRegex.test(data.month)) {
        ctx.addIssue({ code: 'custom', message: 'Enter a month 1-12', path: ['month'] });
      }
    } else if (data.report_type === 'category_analysis') {
      const startResult = dateSchema.safeParse(data.start_date ?? '');
      const endResult = dateSchema.safeParse(data.end_date ?? '');
      if (!startResult.success) {
        ctx.addIssue({ code: 'custom', message: 'Use YYYY-MM-DD', path: ['start_date'] });
      }
      if (!endResult.success) {
        ctx.addIssue({ code: 'custom', message: 'Use YYYY-MM-DD', path: ['end_date'] });
      }
      if (startResult.success && endResult.success && data.end_date! < data.start_date!) {
        ctx.addIssue({ code: 'custom', message: 'End date must be after start date', path: ['end_date'] });
      }
    }
  });

export type GenerateReportFormValues = z.infer<typeof generateReportFormSchema>;
