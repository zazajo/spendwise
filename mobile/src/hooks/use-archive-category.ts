import { useMutation, useQueryClient } from '@tanstack/react-query';

import { archiveCategory } from '@/services/categories';

export function useArchiveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => archiveCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
