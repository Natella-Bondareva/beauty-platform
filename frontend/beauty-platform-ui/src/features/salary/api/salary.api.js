import { api } from '../../../shared/api/client';

// type enum: FixedRate = 0, Percentage = 1
export const CONTRACT_TYPE_ENUM = { FixedRate: 0, Percentage: 1 };
export const CONTRACT_TYPE_FROM_INT = { 0: 'FixedRate', 1: 'Percentage' };
export const CONTRACT_TYPE_LABELS = { FixedRate: 'Фіксована ставка', Percentage: 'Відсоток' };

export const salaryApi = {
  // Контракти
  getContract: (salonId, masterId) =>
    api.get(`/salons/${salonId}/salary/contracts/${masterId}`),

  createContract: (salonId, data) =>
    api.post(`/salons/${salonId}/salary/contracts`, data),
  // data: { masterId, type: number, amount, paymentPeriodDays }

  updateContract: (salonId, contractId, data) =>
    api.put(`/salons/${salonId}/salary/contracts/${contractId}`, data),
  // data: { amount, paymentPeriodDays }

  // Виплати
  getPayments: (salonId, params) =>
    api.get(`/salons/${salonId}/salary/payments`, { params }),
  // params: { masterId?, from?, to? }

  generatePayment: (salonId, data) =>
    api.post(`/salons/${salonId}/salary/payments/generate`, data),
  // data: { masterId, periodStart, periodEnd }

  markAsPaid: (salonId, paymentId, note) =>
    api.post(`/salons/${salonId}/salary/payments/${paymentId}/pay`, { note }),

  // Прогноз
  getForecast: (salonId) =>
    api.get(`/salons/${salonId}/salary/forecast`),
};
