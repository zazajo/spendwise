import { useQuery } from '@tanstack/react-query';

import { fetchCategory } from '@/services/categories';

export function useCategory(id: number) {
  return useQuery({
    queryKey: ['categories', 'detail', id],
    queryFn: () => fetchCategory(id),
    enabled: Number.isFinite(id),
  });
}
