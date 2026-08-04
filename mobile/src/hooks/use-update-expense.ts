import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateExpense, type UpdateExpensePayload } from '@/services/expenses';

export function useUpdateExpense(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateExpensePayload) => updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      // An edit can move the expense between budgets, so refresh all of them
      // rather than guessing which two changed.
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
