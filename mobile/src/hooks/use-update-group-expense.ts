import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateGroupExpense } from '@/services/groups';
import type { GroupExpensePayload } from '@/types/group';

export function useUpdateGroupExpense(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GroupExpensePayload) => updateGroupExpense(id, payload),
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'balance', expense.group] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'detail', expense.group] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'list'] });
    },
  });
}
