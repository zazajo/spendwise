import { useMutation, useQueryClient } from '@tanstack/react-query';

import { settleSplit } from '@/services/groups';

export function useSettleSplit(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, splitId }: { expenseId: number; splitId: number }) =>
      settleSplit(expenseId, splitId),
    onSuccess: () => {
      // Every group query lives under ['groups'], so one invalidation covers
      // the list, detail, balances, expenses, and settlements.
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
