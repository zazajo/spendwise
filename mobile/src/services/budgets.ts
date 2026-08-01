import { api } from '@/services/api';
import type { PaginatedResponse } from '@/types/api';
import type {
  Budget,
  BudgetAlert,
  BudgetFormValues,
  BudgetListParams,
  BudgetSummaryResponse,
} from '@/types/budget';

export async function fetchBudgetSummary(): Promise<BudgetSummaryResponse> {
  const { data } = await api.get<BudgetSummaryResponse>('/budgets/summary/');
  return data;
}

export async function fetchBudgets(params: BudgetListParams): Promise<Budget[]> {
  const { data } = await api.get<PaginatedResponse<Budget>>('/budgets/', {
    params: { ...params, ordering: '-start_date' },
  });
  return data.results;
}

export async function fetchBudget(id: number): Promise<Budget> {
  const { data } = await api.get<Budget>(`/budgets/${id}/`);
  return data;
}

export interface BudgetPayload {
  category: number;
  amount: string;
  period: string;
  start_date: string;
  end_date: string | null;
  alert_threshold: number;
}

function toPayload(values: BudgetFormValues): BudgetPayload {
  return {
    category: values.category,
    amount: values.amount,
    period: values.period,
    start_date: values.start_date,
    end_date: values.end_date || null,
    alert_threshold: Number(values.alert_threshold),
  };
}

export async function createBudget(values: BudgetFormValues): Promise<Budget> {
  const { data } = await api.post<Budget>('/budgets/', toPayload(values));
  return data;
}

export async function updateBudget(id: number, values: BudgetFormValues): Promise<Budget> {
  const { data } = await api.patch<Budget>(`/budgets/${id}/`, toPayload(values));
  return data;
}

export async function deleteBudget(id: number): Promise<void> {
  await api.delete(`/budgets/${id}/`);
}

// spent_amount/remaining_amount/percentage_used are cached on the row and only
// recalculated when the budget itself is written to (create/update) - nothing
// recomputes them when an expense changes, so callers that need current numbers
// (e.g. opening a budget's detail screen) should hit this first.
export async function refreshBudget(id: number): Promise<Budget> {
  const { data } = await api.post<Budget>(`/budgets/${id}/refresh/`);
  return data;
}

export async function fetchBudgetAlerts(params: { is_read?: boolean } = {}): Promise<BudgetAlert[]> {
  const { data } = await api.get<PaginatedResponse<BudgetAlert>>('/budget-alerts/', { params });
  return data.results;
}

export async function markBudgetAlertRead(id: number): Promise<void> {
  await api.post(`/budget-alerts/${id}/mark_read/`);
}

export async function markAllBudgetAlertsRead(): Promise<void> {
  await api.post('/budget-alerts/mark_all_read/');
}
