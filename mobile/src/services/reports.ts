import { api } from '@/services/api';
import type { PaginatedResponse } from '@/types/api';
import type {
  BudgetVarianceData,
  CategoryBreakdownData,
  GenerateReportFormValues,
  GenerateReportResponse,
  MonthlySummaryData,
  Report,
  ReportData,
  ReportListParams,
  ScheduledReport,
  ScheduledReportFormValues,
} from '@/types/report';

export async function fetchReports(params: ReportListParams = {}): Promise<Report[]> {
  const { data } = await api.get<PaginatedResponse<Report>>('/reports/', {
    params: { ordering: '-created_at', ...params },
  });
  return data.results;
}

export async function fetchReport(id: number): Promise<Report> {
  const { data } = await api.get<Report>(`/reports/${id}/`);
  return data;
}

export async function deleteReport(id: number): Promise<void> {
  await api.delete(`/reports/${id}/`);
}

function toParameters(values: GenerateReportFormValues): Record<string, unknown> {
  if (values.report_type === 'category_analysis') {
    return { start_date: values.start_date, end_date: values.end_date };
  }
  return { year: Number(values.year), month: Number(values.month) };
}

// The generate endpoint's response shape depends on `format`: json returns
// {report_id, data, generated_at}, but csv returns the raw CSV text directly with
// no wrapper - so there's no report_id available from a csv-format generation.
// Callers refetch the reports list afterward instead of deep-linking to the new id.
export async function generateReport(values: GenerateReportFormValues): Promise<void> {
  const payload = {
    report_type: values.report_type,
    name: values.name,
    format: values.format,
    parameters: toParameters(values),
  };

  if (values.format === 'csv') {
    await api.post('/reports/generate/', payload, { responseType: 'text' });
  } else {
    await api.post<GenerateReportResponse>('/reports/generate/', payload);
  }
}

// Always returns the exact string to write to a shareable file, for either format.
export async function downloadReportFile(report: Report): Promise<{ content: string; extension: string }> {
  if (report.format === 'csv') {
    const { data } = await api.get<string>(`/reports/${report.id}/download/`, { responseType: 'text' });
    return { content: data, extension: 'csv' };
  }
  const { data } = await api.get(`/reports/${report.id}/download/`);
  return { content: JSON.stringify(data, null, 2), extension: 'json' };
}

async function fetchQuickReportData(report: Report): Promise<ReportData> {
  const params = report.parameters as { year?: number; month?: number; start_date?: string; end_date?: string };
  switch (report.report_type) {
    case 'monthly_summary': {
      const { data } = await api.get<MonthlySummaryData>('/reports/monthly_summary/', {
        params: { year: params.year, month: params.month },
      });
      return data;
    }
    case 'category_analysis': {
      const { data } = await api.get<CategoryBreakdownData>('/reports/category_breakdown/', {
        params: { start_date: params.start_date, end_date: params.end_date },
      });
      return data;
    }
    case 'budget_variance': {
      const { data } = await api.get<BudgetVarianceData>('/reports/budget_variance/', {
        params: { year: params.year, month: params.month },
      });
      return data;
    }
  }
}

// For viewing structured stats (Report Details), always want a parsed object back.
// A csv-format report's /download/ returns raw CSV text (not renderable as stat
// cards), so viewing falls back to the equivalent quick GET endpoint with the same
// saved parameters - same ReportService method, just returned as JSON either way.
export async function fetchReportViewData(report: Report): Promise<ReportData> {
  if (report.format === 'csv') {
    return fetchQuickReportData(report);
  }
  const { data } = await api.get<ReportData>(`/reports/${report.id}/download/`);
  return data;
}

export async function fetchMonthlySummary(year?: number, month?: number): Promise<MonthlySummaryData> {
  const { data } = await api.get<MonthlySummaryData>('/reports/monthly_summary/', { params: { year, month } });
  return data;
}

export async function fetchBudgetVarianceSummary(year?: number, month?: number): Promise<BudgetVarianceData> {
  const { data } = await api.get<BudgetVarianceData>('/reports/budget_variance/', { params: { year, month } });
  return data;
}

export async function fetchCategoryBreakdownSummary(
  startDate?: string,
  endDate?: string
): Promise<CategoryBreakdownData> {
  const { data } = await api.get<CategoryBreakdownData>('/reports/category_breakdown/', {
    params: { start_date: startDate, end_date: endDate },
  });
  return data;
}

// --- Scheduled reports ---

export async function fetchScheduledReports(): Promise<ScheduledReport[]> {
  const { data } = await api.get<PaginatedResponse<ScheduledReport>>('/scheduled-reports/');
  return data.results;
}

export async function fetchScheduledReport(id: number): Promise<ScheduledReport> {
  const { data } = await api.get<ScheduledReport>(`/scheduled-reports/${id}/`);
  return data;
}

export async function createScheduledReport(values: ScheduledReportFormValues): Promise<ScheduledReport> {
  const { data } = await api.post<ScheduledReport>('/scheduled-reports/', { ...values, parameters: {} });
  return data;
}

export async function updateScheduledReport(
  id: number,
  values: ScheduledReportFormValues
): Promise<ScheduledReport> {
  const { data } = await api.patch<ScheduledReport>(`/scheduled-reports/${id}/`, values);
  return data;
}

export async function setScheduledReportActive(id: number, isActive: boolean): Promise<ScheduledReport> {
  const { data } = await api.patch<ScheduledReport>(`/scheduled-reports/${id}/`, { is_active: isActive });
  return data;
}

export async function deleteScheduledReport(id: number): Promise<void> {
  await api.delete(`/scheduled-reports/${id}/`);
}
