import { z } from 'zod';

export interface Category {
  id: number;
  name: string;
  category_type: 'income' | 'expense';
  description: string;
  color: string;
  icon: string;
  is_default: boolean;
  is_active: boolean;
  expense_count: number;
  total_spent: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryListParams {
  search?: string;
  is_active?: boolean;
}

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Keep it under 100 characters'),
  category_type: z.enum(['expense', 'income']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Pick a color'),
  icon: z.string().min(1, 'Pick an icon'),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
