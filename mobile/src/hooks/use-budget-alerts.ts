import { useQuery } from '@tanstack/react-query';

import { fetchBudgetAlerts } from '@/services/budgets';

// Persisted alert log (BudgetAlert rows) - distinct from useLiveBudgetAlerts.
export function useBudgetAlerts() {
  return useQuery({
    queryKey: ['budget-alerts', 'list', { is_read: false }],
    queryFn: () => fetchBudgetAlerts({ is_read: false }),
  });
}
