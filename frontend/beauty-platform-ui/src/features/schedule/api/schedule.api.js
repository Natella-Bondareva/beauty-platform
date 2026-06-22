import { api } from '../../../shared/api/client';

export const scheduleApi = {
  getBookings: (salonId, dateFrom, dateTo) =>
    api.get(`/salons/${salonId}/bookings`, { params: { dateFrom, dateTo } }),

  createAdminBooking: (salonId, data) =>
    api.post(`/salons/${salonId}/bookings/admin`, data),

  getBookingById: (bookingId) =>
    api.get(`/bookings/${bookingId}`),

  cancelBooking: (bookingId, reason) =>
    api.post(`/bookings/${bookingId}/cancel`, { reason }),
};
