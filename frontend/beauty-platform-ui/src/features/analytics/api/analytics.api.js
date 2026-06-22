import { api } from '../../../shared/api/client';

export const analyticsApi = {
  get: (salonId, from, to) =>
    api.get(`/salons/${salonId}/analytics`, { params: { from, to } }),
};
