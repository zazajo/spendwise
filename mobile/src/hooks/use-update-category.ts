import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateCategory } from '@/services/categories';
import type { CategoryFormValues } from '@/types/category';

export function useUpdateCategory(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryFormValues) => updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
