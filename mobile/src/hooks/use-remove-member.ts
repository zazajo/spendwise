import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removeMember } from '@/services/groups';

export function useRemoveMember(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', 'detail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'balance', groupId] });
    },
  });
}
