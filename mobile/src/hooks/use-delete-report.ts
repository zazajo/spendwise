import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteReport } from '@/services/reports';

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
