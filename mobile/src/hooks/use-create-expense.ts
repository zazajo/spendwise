import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createExpense } from '@/services/expenses';

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      // The backend recalculates any budget covering this expense, so the
      // cached budget totals we are holding are now behind.
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
