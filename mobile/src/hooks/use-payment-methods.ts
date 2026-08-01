import { useQuery } from '@tanstack/react-query';

import { fetchPaymentMethods } from '@/services/paymentMethods';

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: fetchPaymentMethods,
    staleTime: 5 * 60_000,
  });
}
