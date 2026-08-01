import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteBudget } from '@/services/budgets';

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
