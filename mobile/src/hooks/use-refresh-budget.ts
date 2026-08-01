import { useMutation, useQueryClient } from '@tanstack/react-query';

import { refreshBudget } from '@/services/budgets';

export function useRefreshBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => refreshBudget(id),
    onSuccess: (budget) => {
      queryClient.setQueryData(['budgets', 'detail', budget.id], budget);
      queryClient.invalidateQueries({ queryKey: ['budgets', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', 'summary'] });
    },
  });
}
