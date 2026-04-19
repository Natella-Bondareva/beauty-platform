import { api } from './client';

export const employeeApi = {
  getAll: (salonId) =>
    api.get(`/salons/${salonId}/employees`),

  getById: (salonId, employeeId) =>
    api.get(`/salons/${salonId}/employees/${employeeId}`),

  assignService: (salonId, employeeId, serviceId, data) =>
    api.post(`/salons/${salonId}/employees/${employeeId}/services/${serviceId}`, data),

  removeService: (salonId, employeeId, serviceId) =>
    api.delete(`/salons/${salonId}/employees/${employeeId}/services/${serviceId}`),

  updateServicePrice: (salonId, employeeId, serviceId, priceOverride) =>
    api.patch(`/salons/${salonId}/employees/${employeeId}/services/${serviceId}/price`, { priceOverride }),
};
