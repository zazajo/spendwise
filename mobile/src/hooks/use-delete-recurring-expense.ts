import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteRecurringExpense } from '@/services/recurring';

export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecurringExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}
