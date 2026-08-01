import { useMutation, useQueryClient } from '@tanstack/react-query';

import { joinGroupByInviteCode } from '@/services/groups';

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) => joinGroupByInviteCode(inviteCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
