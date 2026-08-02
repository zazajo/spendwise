import { useMutation, useQueryClient } from '@tanstack/react-query';

import { batchActionRecurringExpenses } from '@/services/recurring';

export function useRecurringBatchAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: batchActionRecurringExpenses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}
