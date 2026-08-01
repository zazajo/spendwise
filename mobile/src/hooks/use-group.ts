import { useQuery } from '@tanstack/react-query';

import { fetchGroup } from '@/services/groups';

export function useGroup(id: number) {
  return useQuery({
    queryKey: ['groups', 'detail', id],
    queryFn: () => fetchGroup(id),
    enabled: Number.isFinite(id),
  });
}
