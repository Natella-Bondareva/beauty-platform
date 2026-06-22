import { useQuery, useQueries } from '@tanstack/react-query';
import { scheduleApi } from '../api/schedule.api';
import { employeeApi } from '../../employees/api/employee.api';
import { useSalonId } from '../../../shared/hooks/useSalonId';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMondayOfWeek(date) {
  const d = new Date(date);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekRange(date) {
  const mon = getMondayOfWeek(date);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { dateFrom: toIsoDate(mon), dateTo: toIsoDate(sun) };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useScheduleData(selectedDate) {
  const salonId = useSalonId();
  const { dateFrom, dateTo } = getWeekRange(selectedDate);

  // 1. Бронювання за тиждень
  const bookingsQuery = useQuery({
    queryKey: ['schedule', 'bookings', salonId, dateFrom, dateTo],
    queryFn: () =>
      scheduleApi.getBookings(salonId, dateFrom, dateTo).then((r) => r.data),
    enabled: !!salonId,
  });

  // 2. Розклади всіх майстрів одним запитом
  const schedulesQuery = useQuery({
    queryKey: ['schedule', 'schedules', salonId],
    queryFn: () => employeeApi.getSchedules(salonId).then((r) => r.data),
    enabled: !!salonId,
    // Розклад змінюється рідко — кешуємо 5 хв
    staleTime: 5 * 60 * 1000,
  });

  // 3. Перерви кожного майстра за тиждень (паралельно)
  const employees = schedulesQuery.data ?? [];
  const breaksQueries = useQueries({
    queries: employees.map((emp) => ({
      queryKey: ['schedule', 'breaks', salonId, emp.employeeId, dateFrom, dateTo],
      queryFn: () =>
        employeeApi
          .getBreaksRange(salonId, emp.employeeId, dateFrom, dateTo)
          .then((r) => r.data),
      enabled: !!salonId && employees.length > 0,
    })),
  });

  const breaks = breaksQueries.flatMap((q) => q.data ?? []);

  const isBreaksLoading = breaksQueries.some((q) => q.isLoading);

  return {
    bookings: bookingsQuery.data ?? [],
    schedules: schedulesQuery.data ?? [],
    breaks,
    dateFrom,
    dateTo,
    isLoading:
      bookingsQuery.isLoading ||
      schedulesQuery.isLoading ||
      (employees.length > 0 && isBreaksLoading),
    isError:
      bookingsQuery.isError || schedulesQuery.isError,
  };
}
