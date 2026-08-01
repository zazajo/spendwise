export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';
export type HealthStatus = 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement' | 'Poor';

export interface FinancialHealthMetric {
  id: number;
  calculated_at: string;
  budget_adherence_score: number;
  spending_stability_score: number;
  savings_rate_score: number;
  expense_consistency_score: number;
  overall_score: number;
  total_monthly_expenses: string;
  average_daily_spending: string;
  expense_volatility: number;
  recommendations_list: string[];
  health_grade: HealthGrade;
  health_status: HealthStatus;
}

export interface MonthlyTrendPoint {
  year: number;
  month: number;
  month_name: string;
  total_spent: string;
  category_breakdown: Record<string, number>;
}

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Anomaly {
  expense_id: number;
  amount: string;
  description: string;
  date: string;
  category: string;
  category_id: number | null;
  anomaly_score: number;
  reason: string;
  severity: AnomalySeverity;
}

export interface MonthlySummary {
  current_month_total: string;
  previous_month_total: string;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsDashboardResponse {
  financial_health: FinancialHealthMetric;
  spending_trends: MonthlyTrendPoint[];
  recent_anomalies: Anomaly[];
  monthly_summary: MonthlySummary;
}

export interface AnomalyRule {
  id: number;
  name: string;
  threshold_multiplier: number;
  lookback_days: number;
  min_amount: string;
  severity: AnomalySeverity;
  is_active: boolean;
  created_at: string;
  categories: number[];
  category_names: string[];
}

export interface CategoryAnalysisItem {
  category__id: number | null;
  category__name: string | null;
  category__color: string | null;
  total: number;
  count: number;
  percentage: number;
}

export interface CategoryAnalysisResponse {
  period: { year: number; month: number };
  total_spent: number;
  categories: CategoryAnalysisItem[];
}
