import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSettlement } from '@/services/groups';

export function useCreateSettlement(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { from_user: number; to_user: number; amount: string; notes?: string }) =>
      createSettlement({ group: groupId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-settlements', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'balance', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'detail', groupId] });
    },
  });
}
