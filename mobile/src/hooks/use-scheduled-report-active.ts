import { useMutation, useQueryClient } from '@tanstack/react-query';

import { setScheduledReportActive } from '@/services/reports';

export function useSetScheduledReportActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      setScheduledReportActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled'] });
    },
  });
}
