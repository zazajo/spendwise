import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteScheduledReport } from '@/services/reports';

export function useDeleteScheduledReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteScheduledReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'scheduled'] });
    },
  });
}
