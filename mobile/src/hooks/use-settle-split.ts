import { useMutation, useQueryClient } from '@tanstack/react-query';

import { settleSplit } from '@/services/groups';

export function useSettleSplit(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, splitId }: { expenseId: number; splitId: number }) =>
      settleSplit(expenseId, splitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'balance', groupId] });
    },
  });
}
