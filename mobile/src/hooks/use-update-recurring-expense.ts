import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateRecurringExpense } from '@/services/recurring';
import type { RecurringFormValues } from '@/types/recurring';

export function useUpdateRecurringExpense(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: RecurringFormValues) => updateRecurringExpense(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}
