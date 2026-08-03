import { api } from '@/services/api';
import type { PaginatedResponse } from '@/types/api';
import type { PaymentMethod } from '@/types/payment-method';

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const { data } = await api.get<PaginatedResponse<PaymentMethod>>('/payment-methods/', {
    params: { ordering: 'name' },
  });
  return data.results;
}
