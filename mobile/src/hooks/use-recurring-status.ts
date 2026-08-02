import { useMutation, useQueryClient } from '@tanstack/react-query';

import { pauseRecurringExpense, resumeRecurringExpense } from '@/services/recurring';

export function usePauseRecurringExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pauseRecurringExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}

export function useResumeRecurringExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => resumeRecurringExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
}
