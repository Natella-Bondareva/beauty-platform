import { api } from '../../../shared/api/client';

export const settingsApi = {
  get: (salonId) => api.get(`/salons/${salonId}`),
  update: (salonId, data) => api.put(`/salons/${salonId}/settings`, data),
  addRegularDayOff: (salonId, dayOfWeek) =>
    api.post(`/salons/${salonId}/settings/regular-days-off`, { dayOfWeek }),
  removeRegularDayOff: (salonId, dayOfWeek) =>
    api.delete(`/salons/${salonId}/settings/regular-days-off/${dayOfWeek}`),
  addSpecialDayOff: (salonId, date, reason) =>
    api.post(`/salons/${salonId}/settings/special-days-off`, { date, reason }),
  removeSpecialDayOff: (salonId, id) =>
    api.delete(`/salons/${salonId}/settings/special-days-off/${id}`),
};
