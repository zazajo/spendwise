import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createScheduledReport } from '@/services/reports';

export function useCreateScheduledReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createScheduledReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled'] });
    },
  });
}
