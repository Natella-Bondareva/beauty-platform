import { api } from '../../../shared/api/client';

export const employeeApi = {
  getAll: (salonId) => api.get(`/salons/${salonId}/employees`),
  getById: (salonId, employeeId) => api.get(`/salons/${salonId}/employees/${employeeId}`),

  create: (salonId, data) => api.post(`/salons/${salonId}/employees`, data),
  update: (salonId, employeeId, data) => api.put(`/salons/${salonId}/employees/${employeeId}`, data),

  assignService: (salonId, employeeId, serviceId, data) =>
    api.post(`/salons/${salonId}/employees/${employeeId}/services/${serviceId}`, data),
  removeService: (salonId, employeeId, serviceId) =>
    api.delete(`/salons/${salonId}/employees/${employeeId}/services/${serviceId}`),
  updateServicePrice: (salonId, employeeId, serviceId, priceOverride) =>
    api.patch(`/salons/${salonId}/employees/${employeeId}/services/${serviceId}/price`, {
      priceOverride,
    }),

  getScheduleConstraints: (salonId, employeeId) =>
    api.get(`/salons/${salonId}/employees/${employeeId}/schedule-constraints`),
  updateSchedule: (salonId, employeeId, schedule) =>
    api.put(`/salons/${salonId}/employees/${employeeId}/schedule`, schedule),
};
