import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateReport } from '@/services/reports';

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
