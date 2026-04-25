import { api } from '../../../shared/api/client';

export const salonApi = {
  create: (data) => api.post('/salons', data),
  getMy: () => api.get('/salons/my'),
  getById: (salonId) => api.get(`/salons/${salonId}`),
  update: (salonId, data) => api.put(`/salons/${salonId}`, data),

  getCategories: (salonId) => api.get(`/salons/${salonId}/categories`),
  getActiveCategories: (salonId) => api.get(`/salons/${salonId}/categories/active`),
  createCategory: (salonId, data) => api.post(`/salons/${salonId}/categories`, data),
  updateCategory: (salonId, categoryId, data) =>
    api.put(`/salons/${salonId}/categories/${categoryId}`, data),

  getServices: (salonId) => api.get(`/salons/${salonId}/services`),
  createService: (salonId, data) => api.post(`/salons/${salonId}/services`, data),
  updateService: (salonId, serviceId, data) =>
    api.put(`/salons/${salonId}/services/${serviceId}`, data),
  deleteService: (salonId, serviceId) =>
    api.delete(`/salons/${salonId}/services/${serviceId}`),

  registerSelf: (salonId, data) => api.post(`/salons/${salonId}/employees/self`, data),
  createEmployee: (salonId, data) => api.post(`/salons/${salonId}/employees`, data),
};
