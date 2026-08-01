import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateExpense, type UpdateExpensePayload } from '@/services/expenses';

export function useUpdateExpense(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateExpensePayload) => updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
