import { api } from '@/services/api';
import type { PaginatedResponse } from '@/types/api';
import type { Category, CategoryFormValues, CategoryListParams } from '@/types/category';

export async function fetchExpenseCategories(): Promise<Category[]> {
  const { data } = await api.get<PaginatedResponse<Category>>('/categories/', {
    params: { category_type: 'expense', is_active: true, ordering: 'name' },
  });
  return data.results;
}

export async function fetchCategories(params: CategoryListParams): Promise<Category[]> {
  const { data } = await api.get<PaginatedResponse<Category>>('/categories/', {
    params: { ...params, ordering: 'name' },
  });
  return data.results;
}

export async function fetchCategory(id: number): Promise<Category> {
  const { data } = await api.get<Category>(`/categories/${id}/`);
  return data;
}

export async function createCategory(payload: CategoryFormValues): Promise<Category> {
  const { data } = await api.post<Category>('/categories/', payload);
  return data;
}

export async function updateCategory(id: number, payload: CategoryFormValues): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}/`, payload);
  return data;
}

export async function archiveCategory(id: number): Promise<void> {
  await api.post(`/categories/${id}/archive/`);
}

export async function restoreCategory(id: number): Promise<void> {
  await api.post(`/categories/${id}/restore/`);
}
