import { api } from '@/services/api';
import type {
  AnalyticsDashboardResponse,
  Anomaly,
  AnomalyRule,
  CategoryAnalysisResponse,
  FinancialHealthMetric,
} from '@/types/analytics';
import type { PaginatedResponse } from '@/types/api';

export async function fetchAnalyticsDashboard(): Promise<AnalyticsDashboardResponse> {
  const { data } = await api.get<AnalyticsDashboardResponse>('/analytics/dashboard/dashboard/');
  return data;
}

export async function refreshHealthScore(): Promise<FinancialHealthMetric> {
  const { data } = await api.post<FinancialHealthMetric>('/analytics/dashboard/refresh_health_score/');
  return data;
}

export async function fetchHealthHistory(): Promise<FinancialHealthMetric[]> {
  const { data } = await api.get<PaginatedResponse<FinancialHealthMetric>>('/analytics/health-metrics/');
  return data.results;
}

export async function fetchAnomalies(): Promise<{ total_anomalies: number; anomalies: Anomaly[] }> {
  const { data } = await api.get<{ total_anomalies: number; anomalies: Anomaly[] }>(
    '/analytics/dashboard/detect_anomalies/'
  );
  return data;
}

export async function fetchAnomalyRules(): Promise<AnomalyRule[]> {
  const { data } = await api.get<PaginatedResponse<AnomalyRule>>('/analytics/anomaly-rules/');
  return data.results;
}

// Creates a rule with the model's own sensible defaults (2x average, $10 minimum,
// medium severity) - just enough for detect_anomalies to have something to compare against.
export async function createDefaultAnomalyRule(): Promise<AnomalyRule> {
  const { data } = await api.post<AnomalyRule>('/analytics/anomaly-rules/', {
    name: 'Default Rule',
  });
  return data;
}

// Deliberately does not accept year/month params - the backend view constructs
// `f"{year}-{month}-31"` for the end date, which throws a 500 for any month with
// fewer than 31 days. Only the safe, param-less (current month) path is used here;
// month-to-month browsing is built on /expenses/summary/ instead (see use-category-analysis).
export async function fetchCurrentMonthCategoryAnalysis(): Promise<CategoryAnalysisResponse> {
  const { data } = await api.get<CategoryAnalysisResponse>('/analytics/dashboard/category_analysis/');
  return data;
}
