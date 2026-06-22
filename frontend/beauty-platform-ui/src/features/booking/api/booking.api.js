import axios from 'axios';

// Окремий клієнт без auth-interceptor — сторінка бронювання публічна
const publicApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:5257/api',
});

export const bookingApi = {
  getServices: (salonId) => publicApi.get(`/salons/${salonId}/services`),
  getActiveCategories: (salonId) => publicApi.get(`/salons/${salonId}/categories/active`),
  getEmployees: (salonId) => publicApi.get(`/salons/${salonId}/employees`),
  getEmployeesForService: (salonId, serviceId) =>
    publicApi.get(`/salons/${salonId}/employees/by-service/${serviceId}`),

  getSlots: (salonId, serviceId, date) =>
    publicApi.get(`/salons/${salonId}/available-slots`, { params: { serviceId, date } }),

  getEmployeeSlots: (salonId, employeeId, serviceId, date) =>
    publicApi.get(`/salons/${salonId}/employees/${employeeId}/available-slots`, {
      params: { serviceId, date },
    }),

  getBookingFields: (salonId, serviceId, masterId) =>
    publicApi.get(`/salons/${salonId}/booking-fields/for-booking`, {
      params: { serviceId, masterId },
    }),

  // Сценарій 4: найближчий вільний слот кожного майстра (горизонт 14 днів)
  getNearestSlots: (salonId, serviceId) =>
    publicApi.get(`/salons/${salonId}/nearest-slots`, { params: { serviceId } }),

  createBooking: (salonId, data) => publicApi.post(`/salons/${salonId}/bookings`, data),
  verifyCode: (bookingId, code) =>
    publicApi.post(`/bookings/${bookingId}/verify-code`, { code }),

  // ── Клієнтська самостійна робота (публічні) ──────────────────────────
  requestClientCode: (salonId, phone) =>
    publicApi.post(`/salons/${salonId}/bookings/request-client-code`, { phone }),

  getClientHistory: (salonId, phone, code) =>
    publicApi.post(`/salons/${salonId}/bookings/client-history`, { phone, code }),

  cancelByClient: (bookingId, phone, code) =>
    publicApi.post(`/bookings/${bookingId}/client-cancel`, { phone, code }),
};
