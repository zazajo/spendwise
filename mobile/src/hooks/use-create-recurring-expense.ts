import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createRecurringExpense } from '@/services/recurring';

export function useCreateRecurringExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRecurringExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}
