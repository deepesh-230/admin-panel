import { apiClient } from '../utils/apiClient';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export type PaymentPurpose =
  | 'SPONSORSHIP'
  | 'MARKETPLACE'
  | 'SUBSCRIPTION'
  | 'DONATION'
  | 'OTHER';

export type Payment = {
  id: string;
  userId: string | null;
  payerName: string | null;
  payerEmail: string | null;
  payerPhone: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  purpose: PaymentPurpose;
  planId: string | null;
  gateway: string | null;
  orderId: string | null;
  paymentId: string | null;
  referenceNo: string | null;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string | null; email: string; phone: string | null } | null;
};

export type PaymentSummary = {
  successCount: number;
  successAmount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
};

export const paymentsApi = {
  getAll: (params?: {
    search?: string;
    status?: PaymentStatus | '';
    purpose?: PaymentPurpose | '';
    from?: string;
    to?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.status) sp.set('status', params.status);
    if (params?.purpose) sp.set('purpose', params.purpose);
    if (params?.from) sp.set('from', params.from);
    if (params?.to) sp.set('to', params.to);
    const q = sp.toString() ? `?${sp}` : '';
    return apiClient.get<Payment[]>(`/api/v1/payments${q}`);
  },

  getSummary: () => apiClient.get<PaymentSummary>('/api/v1/payments/summary'),

  getById: (id: string) => apiClient.get<Payment>(`/api/v1/payments/${id}`),

  create: (data: Partial<Payment>) => apiClient.post<Payment>('/api/v1/payments', data),

  update: (id: string, data: Partial<Payment>) =>
    apiClient.patch<Payment>(`/api/v1/payments/${id}`, data),

  remove: (id: string) => apiClient.delete<void>(`/api/v1/payments/${id}`),
};
