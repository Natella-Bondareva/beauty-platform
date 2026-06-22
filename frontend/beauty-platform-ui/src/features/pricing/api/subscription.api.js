import { api } from '../../../shared/api/client';

export const subscriptionApi = {
  getConfig: () =>
    api.get('/subscription/config'),

  get: (salonId) =>
    api.get(`/salons/${salonId}/subscription`),

  addMasterSlots: (salonId, count, months) =>
    api.post(`/salons/${salonId}/subscription/masters`, { count, months }),

  addModule: (salonId, module, months) =>
    api.post(`/salons/${salonId}/subscription/modules`, { module, months }),

  // Payment flow (fake now, real provider later)
  pay: (salonId, itemType, moduleId, slotCount, months) =>
    api.post(`/salons/${salonId}/subscription/payment`, { itemType, moduleId, slotCount, months }),

  getPayments: (salonId) =>
    api.get(`/salons/${salonId}/subscription/payments`),
};
