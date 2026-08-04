import { useQuery } from '@tanstack/react-query';

import { fetchPaymentMethods } from '@/services/payment-methods';

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods', 'list'],
    queryFn: fetchPaymentMethods,
    staleTime: 5 * 60_000,
  });
}
