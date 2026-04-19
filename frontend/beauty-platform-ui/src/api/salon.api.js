import { api } from './client';

export const salonApi = {
  create: (data) => api.post('/salons', data),
  getById: (salonId) => api.get(`/salons/${salonId}`),
  update: (salonId, data) => api.put(`/salons/${salonId}`, data),
  getCategories: (salonId) => api.get(`/salons/${salonId}/categories`),
  registerSelf: (salonId, data) => api.post(`/salons/${salonId}/employees/self`, data),
  createEmployee: (salonId, data) => api.post(`/salons/${salonId}/employees`, data),
  getServices: (salonId) => api.get(`/salons/${salonId}/services`),
  createService: (salonId, data) => api.post(`/salons/${salonId}/services`, data),
  updateService: (salonId, serviceId, data) => api.put(`/salons/${salonId}/services/${serviceId}`, data),
};
