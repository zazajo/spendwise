import { api } from '@/services/api';
import type { PaginatedResponse } from '@/types/api';
import type {
  Expense,
  ExpenseListParams,
  ExpenseSummaryResponse,
  PaymentStatus,
} from '@/types/expense';

export async function fetchExpenses(params: ExpenseListParams): Promise<PaginatedResponse<Expense>> {
  const { data } = await api.get<PaginatedResponse<Expense>>('/expenses/', { params });
  return data;
}

export async function fetchExpenseSummary(params: {
  start_date: string;
  end_date: string;
}): Promise<ExpenseSummaryResponse> {
  const { data } = await api.get<ExpenseSummaryResponse>('/expenses/summary/', { params });
  return data;
}

export async function fetchExpense(id: number): Promise<Expense> {
  const { data } = await api.get<Expense>(`/expenses/${id}/`);
  return data;
}

export interface CreateExpensePayload {
  amount: string;
  description: string;
  date: string;
  category: number | null;
  payment_method: number | null;
  notes: string;
  location: string;
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  const { data } = await api.post<Expense>('/expenses/', payload);
  return data;
}

export interface UpdateExpensePayload extends CreateExpensePayload {
  payment_status: PaymentStatus;
}

export async function updateExpense(id: number, payload: UpdateExpensePayload): Promise<Expense> {
  const { data } = await api.patch<Expense>(`/expenses/${id}/`, payload);
  return data;
}

export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/expenses/${id}/`);
}
