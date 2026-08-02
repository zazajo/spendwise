import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateDueRecurringExpenses } from '@/services/recurring';

export function useGenerateDueRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateDueRecurringExpenses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
