import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateGroupExpense } from '@/services/groups';
import type { GroupExpensePayload } from '@/types/group';

export function useUpdateGroupExpense(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GroupExpensePayload) => updateGroupExpense(id, payload),
    onSuccess: () => {
      // Every group query lives under ['groups'], so one invalidation covers
      // the list, detail, balances, expenses, and settlements.
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
