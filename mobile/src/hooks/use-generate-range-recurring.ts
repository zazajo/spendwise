import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateRangeRecurringExpenses } from '@/services/recurring';

export function useGenerateRangeRecurring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateRangeRecurringExpenses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
