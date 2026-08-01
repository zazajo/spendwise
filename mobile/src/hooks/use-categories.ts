import { useQuery } from '@tanstack/react-query';

import { fetchCategories } from '@/services/categories';
import type { Category, CategoryListParams } from '@/types/category';

export interface GroupedCategories {
  expense: Category[];
  income: Category[];
}

export function useCategories(params: CategoryListParams) {
  return useQuery({
    queryKey: ['categories', 'list', params],
    queryFn: () => fetchCategories(params),
    select: (categories): GroupedCategories => ({
      expense: categories.filter((category) => category.category_type === 'expense'),
      income: categories.filter((category) => category.category_type === 'income'),
    }),
  });
}
