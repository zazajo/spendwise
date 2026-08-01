import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createGroup } from '@/services/groups';

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
