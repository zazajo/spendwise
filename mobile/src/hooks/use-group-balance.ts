import { useQuery } from '@tanstack/react-query';

import { fetchGroupBalance } from '@/services/groups';

export function useGroupBalance(groupId: number) {
  return useQuery({
    queryKey: ['groups', 'balance', groupId],
    queryFn: () => fetchGroupBalance(groupId),
    enabled: Number.isFinite(groupId),
  });
}
