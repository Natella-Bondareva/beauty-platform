import { api } from '../../../shared/api/client';

export const bookingFieldsApi = {
  getAll: (salonId) =>
    api.get(`/salons/${salonId}/booking-fields`),

  create: (salonId, data) =>
    api.post(`/salons/${salonId}/booking-fields`, data),

  update: (salonId, fieldId, data) =>
    api.put(`/salons/${salonId}/booking-fields/${fieldId}`, data),

  delete: (salonId, fieldId) =>
    api.delete(`/salons/${salonId}/booking-fields/${fieldId}`),
};
