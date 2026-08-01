import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateBudget } from '@/services/budgets';
import type { BudgetFormValues } from '@/types/budget';

export function useUpdateBudget(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: BudgetFormValues) => updateBudget(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
