import { api } from '../../../shared/api/client';

export const employeeApi = {
  getAll: (salonId) => api.get(`/salons/${salonId}/employees`),
  getById: (salonId, employeeId) => api.get(`/salons/${salonId}/employees/${employeeId}`),

  create: (salonId, data) => api.post(`/salons/${salonId}/employees`, data),
  update: (salonId, employeeId, data) => api.put(`/salons/${salonId}/employees/${employeeId}`, data),

  activate: (salonId, employeeId) => api.patch(`/salons/${salonId}/employees/${employeeId}/activate`),
  deactivate: (salonId, employeeId) => api.patch(`/salons/${salonId}/employees/${employeeId}/deactivate`),
  archive: (salonId, employeeId) => api.patch(`/salons/${salonId}/employees/${employeeId}/archive`),
  unarchive: (salonId, employeeId) => api.patch(`/salons/${salonId}/employees/${employeeId}/unarchive`),
  delete: (salonId, employeeId) => api.delete(`/salons/${salonId}/employees/${employeeId}`),

  assignService: (salonId, employeeId, serviceId, data) =>
    api.post(`/salons/${salonId}/employees/${employeeId}/services/${serviceId}`, data),
  removeService: (salonId, employeeId, serviceId) =>
    api.delete(`/salons/${salonId}/employees/${employeeId}/services/${serviceId}`),
  updateServiceOverrides: (salonId, employeeId, serviceId, data) =>
    api.patch(`/salons/${salonId}/employees/${employeeId}/services/${serviceId}/overrides`, data),

  getScheduleConstraints: (salonId, employeeId) =>
    api.get(`/salons/${salonId}/employees/${employeeId}/schedule-constraints`),
  updateSchedule: (salonId, employeeId, schedule) =>
    api.put(`/salons/${salonId}/employees/${employeeId}/schedule`, schedule),

  // Розклади всіх майстрів одним запитом (для шахматки)
  getSchedules: (salonId) =>
    api.get(`/salons/${salonId}/employees/schedules`),

  // Перерви майстра за діапазон дат
  getBreaksRange: (salonId, employeeId, dateFrom, dateTo) =>
    api.get(`/salons/${salonId}/employees/${employeeId}/breaks`, {
      params: { dateFrom, dateTo },
    }),
};
