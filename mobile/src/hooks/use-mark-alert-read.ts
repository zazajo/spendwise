import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markAllBudgetAlertsRead, markBudgetAlertRead } from '@/services/budgets';

export function useMarkAlertRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markBudgetAlertRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', 'alerts'] });
    },
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllBudgetAlertsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', 'alerts'] });
    },
  });
}
