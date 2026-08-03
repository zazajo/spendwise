import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removeMember } from '@/services/groups';

export function useRemoveMember(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => removeMember(groupId, userId),
    onSuccess: () => {
      // Every group query lives under ['groups'], so one invalidation covers
      // the list, detail, balances, expenses, and settlements.
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
