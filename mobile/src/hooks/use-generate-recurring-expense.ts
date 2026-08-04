import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateNextRecurringExpense } from '@/services/recurring';

export function useGenerateRecurringExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => generateNextRecurringExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
