import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateScheduledReport } from '@/services/reports';
import type { ScheduledReportFormValues } from '@/types/reports';

export function useUpdateScheduledReport(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ScheduledReportFormValues) => updateScheduledReport(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
  });
}
