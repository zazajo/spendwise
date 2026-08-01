import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBudget } from '@/services/budgets';

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
