import { useMutation, useQueryClient } from '@tanstack/react-query';

import { restoreCategory } from '@/services/categories';

export function useRestoreCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => restoreCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
