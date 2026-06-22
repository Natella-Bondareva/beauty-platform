import { api } from '../../../shared/api/client';

export const settingsApi = {
  getSalon: (salonId) => api.get(`/salons/${salonId}`),
  updateSalon: (salonId, data) => api.put(`/salons/${salonId}`, data),

  getSettings: (salonId) => api.get(`/salons/${salonId}/settings`),
  updateSettings: (salonId, data) => api.put(`/salons/${salonId}/settings`, data),

  addRegularDayOff: (salonId, dayOfWeek) =>
    api.post(`/salons/${salonId}/settings/regular-days-off`, { dayOfWeek }),
  removeRegularDayOff: (salonId, dayOfWeek) =>
    api.delete(`/salons/${salonId}/settings/regular-days-off/${dayOfWeek}`),

  addSpecialDayOff: (salonId, data) =>
    api.post(`/salons/${salonId}/settings/special-days-off`, data),
  removeSpecialDayOff: (salonId, id) =>
    api.delete(`/salons/${salonId}/settings/special-days-off/${id}`),

  addBreak: (salonId, data) => api.post(`/salons/${salonId}/settings/breaks`, data),
};
