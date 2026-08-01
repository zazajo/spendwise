import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addMember } from '@/services/groups';
import type { MemberRole } from '@/types/group';

export function useAddMember(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role?: MemberRole }) =>
      addMember(groupId, username, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', 'detail', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'list'] });
    },
  });
}
