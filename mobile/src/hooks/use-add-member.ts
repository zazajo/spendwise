import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addMember } from '@/services/groups';
import type { MemberRole } from '@/types/group';

export function useAddMember(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role?: MemberRole }) =>
      addMember(groupId, username, role),
    onSuccess: () => {
      // Every group query lives under ['groups'], so one invalidation covers
      // the list, detail, balances, expenses, and settlements.
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
