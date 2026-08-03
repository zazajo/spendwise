import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSettlement } from '@/services/groups';

export function useCreateSettlement(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { from_user: number; to_user: number; amount: string; notes?: string }) =>
      createSettlement({ group: groupId, ...payload }),
    onSuccess: () => {
      // Every group query lives under ['groups'], so one invalidation covers
      // the list, detail, balances, expenses, and settlements.
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
