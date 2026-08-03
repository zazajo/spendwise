import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteGroupExpense } from '@/services/groups';

export function useDeleteGroupExpense(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGroupExpense(id),
    onSuccess: () => {
      // Every group query lives under ['groups'], so one invalidation covers
      // the list, detail, balances, expenses, and settlements.
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
