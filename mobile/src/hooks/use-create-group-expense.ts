import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createGroupExpense } from '@/services/groups';
import type { GroupExpensePayload } from '@/types/group';

export function useCreateGroupExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GroupExpensePayload) => createGroupExpense(payload),
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'balance', expense.group] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'detail', expense.group] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'list'] });
    },
  });
}
