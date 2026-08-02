import { api } from '@/services/api';
import type { PaginatedResponse } from '@/types/api';
import type {
  RecurringDashboardResponse,
  RecurringExpense,
  RecurringFormValues,
  RecurringGenerateBatchResponse,
  RecurringGenerateResponse,
  RecurringListParams,
  RecurringLog,
  RecurringUpcomingResponse,
} from '@/types/recurring';

export async function fetchRecurringExpenses(params: RecurringListParams): Promise<RecurringExpense[]> {
  const { data } = await api.get<PaginatedResponse<RecurringExpense>>('/recurring-expenses/', {
    params,
  });
  return data.results;
}

export async function fetchRecurringExpense(id: number): Promise<RecurringExpense> {
  const { data } = await api.get<RecurringExpense>(`/recurring-expenses/${id}/`);
  return data;
}

export async function fetchRecurringDashboard(): Promise<RecurringDashboardResponse> {
  const { data } = await api.get<RecurringDashboardResponse>('/recurring-expenses/dashboard/');
  return data;
}

// recurring-logs/ has no recurring_expense filter registered server-side, so
// callers that need one expense's history filter this client-side by id.
export async function fetchRecurringLogs(): Promise<RecurringLog[]> {
  const { data } = await api.get<PaginatedResponse<RecurringLog>>('/recurring-logs/', {
    params: { ordering: '-scheduled_date' },
  });
  return data.results;
}

export async function fetchRecurringUpcoming(id: number, count = 5): Promise<RecurringUpcomingResponse> {
  const { data } = await api.get<RecurringUpcomingResponse>(`/recurring-expenses/${id}/upcoming/`, {
    params: { count },
  });
  return data;
}

export interface RecurringPayload {
  description: string;
  amount: string;
  category: number;
  payment_method: number | null;
  frequency: string;
  interval: number;
  start_date: string;
  end_date: string | null;
  notes: string;
}

function toPayload(values: RecurringFormValues): RecurringPayload {
  return {
    description: values.description,
    amount: values.amount,
    category: values.category,
    payment_method: values.payment_method,
    frequency: values.frequency,
    interval: Number(values.interval),
    start_date: values.start_date,
    end_date: values.end_date || null,
    notes: values.notes ?? '',
  };
}

export async function createRecurringExpense(values: RecurringFormValues): Promise<RecurringExpense> {
  const { data } = await api.post<RecurringExpense>('/recurring-expenses/', toPayload(values));
  return data;
}

export async function updateRecurringExpense(
  id: number,
  values: RecurringFormValues
): Promise<RecurringExpense> {
  const { data } = await api.patch<RecurringExpense>(`/recurring-expenses/${id}/`, toPayload(values));
  return data;
}

export async function deleteRecurringExpense(id: number): Promise<void> {
  await api.delete(`/recurring-expenses/${id}/`);
}

export async function pauseRecurringExpense(id: number): Promise<void> {
  await api.post(`/recurring-expenses/${id}/pause/`);
}

export async function resumeRecurringExpense(id: number): Promise<void> {
  await api.post(`/recurring-expenses/${id}/resume/`);
}

export async function generateNextRecurringExpense(id: number): Promise<RecurringGenerateResponse> {
  const { data } = await api.post<RecurringGenerateResponse>(`/recurring-expenses/${id}/generate_next/`);
  return data;
}

export async function generateDueRecurringExpenses(): Promise<RecurringGenerateBatchResponse> {
  const { data } = await api.post<RecurringGenerateBatchResponse>('/recurring-expenses/generate_due/');
  return data;
}

export async function generateRangeRecurringExpenses(params: {
  start_date: string;
  end_date: string;
  recurring_ids?: number[];
}): Promise<RecurringGenerateBatchResponse> {
  const { data } = await api.post<RecurringGenerateBatchResponse>(
    '/recurring-expenses/generate_range/',
    params
  );
  return data;
}

export async function batchActionRecurringExpenses(params: {
  recurring_expense_ids: number[];
  action: 'activate' | 'deactivate' | 'delete';
}): Promise<void> {
  await api.post('/recurring-expenses/batch_action/', params);
}
