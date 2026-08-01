import { useQuery } from '@tanstack/react-query';

import { fetchGroups } from '@/services/groups';
import type { GroupListParams } from '@/types/group';

export function useGroups(params: GroupListParams) {
  return useQuery({
    queryKey: ['groups', 'list', params],
    queryFn: () => fetchGroups(params),
  });
}
