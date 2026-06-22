import { api } from '../../../shared/api/client';

export const masterApi = {
  // ── Profile ──────────────────────────────────────────────────────────────
  getMyProfile: (salonId) =>
    api.get(`/salons/${salonId}/employees/me`),

  // ── Bookings ─────────────────────────────────────────────────────────────
  getMyBookings: (salonId, params) =>
    api.get(`/salons/${salonId}/bookings/my`, { params }),

  getBookingById: (bookingId) =>
    api.get(`/bookings/${bookingId}`),

  completeBooking: (bookingId) =>
    api.post(`/bookings/${bookingId}/complete`),

  // ── Schedule ─────────────────────────────────────────────────────────────
  getMyScheduleConstraints: (salonId) =>
    api.get(`/salons/${salonId}/employees/me/schedule-constraints`),

  setMySchedule: (salonId, schedule) =>
    api.put(`/salons/${salonId}/employees/me/schedule`, schedule),

  // ── Breaks ───────────────────────────────────────────────────────────────
  getMyBreaks: (salonId, date) =>
    api.get(`/salons/${salonId}/employees/me/breaks`, { params: { date } }),

  addMyBreak: (salonId, data) =>
    api.post(`/salons/${salonId}/employees/me/breaks`, data),

  deleteMyBreak: (salonId, breakId) =>
    api.delete(`/salons/${salonId}/employees/me/breaks/${breakId}`),
};
