import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteGroupExpense } from '@/services/groups';

export function useDeleteGroupExpense(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGroupExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'balance', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'detail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'list'] });
    },
  });
}
