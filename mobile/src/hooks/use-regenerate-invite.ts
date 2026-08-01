import { useMutation, useQueryClient } from '@tanstack/react-query';

import { regenerateInviteCode } from '@/services/groups';

export function useRegenerateInvite(groupId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => regenerateInviteCode(groupId),
    onSuccess: (data) => {
      queryClient.setQueryData<{ invite_code: string } & Record<string, unknown>>(
        ['groups', 'detail', groupId],
        (current) => (current ? { ...current, invite_code: data.invite_code } : current)
      );
    },
  });
}
