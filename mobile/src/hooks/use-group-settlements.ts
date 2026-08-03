import { useQuery } from '@tanstack/react-query';

import { fetchGroupSettlements } from '@/services/groups';

export function useGroupSettlements(groupId: number) {
  return useQuery({
    queryKey: ['groups', 'settlements', groupId],
    queryFn: () => fetchGroupSettlements(groupId),
    enabled: Number.isFinite(groupId),
  });
}
