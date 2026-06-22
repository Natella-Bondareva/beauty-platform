import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '../api/schedule.api';
import { clientApi } from '../../clients/api/client.api';
import { employeeApi } from '../../employees/api/employee.api';
import { useSalonId } from '../../../shared/hooks/useSalonId';

// Конвертує локальний Date + "HH:MM" рядок → UTC ISO string
function localDateTimeToUtc(date, timeLabel) {
  const [h, m] = timeLabel.split(':').map(Number);
  const local = new Date(date);
  local.setHours(h, m, 0, 0);
  return local.toISOString();
}

// Перевіряє чи два інтервали перетинаються (в хвилинах від початку дня)
function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function toMinutes(utcStr) {
  const d = new Date(utcStr);
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * Хук для логіки адмін-запису.
 *
 * @param {object|null} slot  — { employeeId, date: Date, time: "HH:MM" } або null (модальне закрите)
 * @param {Array}       bookings — вже завантажені бронювання тижня (для перевірки конфліктів)
 * @param {object[]}    employees — масив співробітників (для відображення імені)
 * @param {function}    onSuccess — callback після успішного запису
 */
export function useAdminBooking({ slot, bookings, employees, onSuccess }) {
  const salonId = useSalonId();
  const qc = useQueryClient();

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [clientPhone, setClientPhone]             = useState('');
  const [clientFirstName, setClientFirstName]     = useState('');
  const [notes, setNotes]                         = useState('');

  // ── Client search state ───────────────────────────────────────────────────
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [selectedClient, setSelectedClient]       = useState(null); // { id, phone, fullName } | null
  const [searchLoading, setSearchLoading]         = useState(false);
  const debounceRef = useRef(null);

  // ── Reset when slot changes ───────────────────────────────────────────────
  useEffect(() => {
    setSelectedServiceId('');
    setClientPhone('');
    setClientFirstName('');
    setNotes('');
    setClientSuggestions([]);
    setSelectedClient(null);
  }, [slot?.employeeId, slot?.time, slot?.date]);

  // ── Load employee services ────────────────────────────────────────────────
  const { data: employeeDetail, isLoading: servicesLoading } = useQuery({
    queryKey: ['employee', salonId, slot?.employeeId],
    queryFn: () =>
      employeeApi.getById(salonId, slot.employeeId).then((r) => r.data),
    enabled: !!salonId && !!slot?.employeeId,
    staleTime: 60_000,
  });

  const employeeServices = employeeDetail?.services ?? [];

  // ── Conflict detection (on already-loaded bookings) ───────────────────────
  const conflict = (() => {
    if (!slot || !selectedServiceId) return null;
    const svc = employeeServices.find((s) => s.serviceId === selectedServiceId);
    if (!svc) return null;

    const startUtc = localDateTimeToUtc(slot.date, slot.time);
    const endUtc   = new Date(new Date(startUtc).getTime() + svc.effectiveSystemDuration * 60_000).toISOString();

    const startMins = toMinutes(startUtc);
    const endMins   = toMinutes(endUtc);

    const conflicting = bookings.filter((b) => {
      if (b.employeeId !== slot.employeeId) return false;
      if (![0, 1].includes(b.status)) return false; // лише Pending/Confirmed
      const bStart = toMinutes(b.startTimeUtc);
      const bEnd   = toMinutes(b.endTimeUtc);
      return rangesOverlap(startMins, endMins, bStart, bEnd);
    });
    return conflicting.length > 0 ? conflicting : null;
  })();

  // ── Debounced client search ───────────────────────────────────────────────
  const handlePhoneChange = useCallback((value) => {
    setClientPhone(value);
    setSelectedClient(null);
    setClientSuggestions([]);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value || value.length < 3) {
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await clientApi.search(salonId, value);
        setClientSuggestions(res.data ?? []);
      } catch {
        setClientSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, [salonId]);

  const pickClient = useCallback((client) => {
    setSelectedClient(client);
    setClientPhone(client.phone);
    setClientFirstName(client.fullName ?? '');
    setClientSuggestions([]);
  }, []);

  // ── Mutation ──────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: () => {
      const svc      = employeeServices.find((s) => s.serviceId === selectedServiceId);
      const startUtc = localDateTimeToUtc(slot.date, slot.time);

      return scheduleApi.createAdminBooking(salonId, {
        serviceId:      selectedServiceId,
        employeeId:     slot.employeeId,
        startTimeUtc:   startUtc,
        clientPhone:    clientPhone.trim(),
        clientFirstName: clientFirstName.trim() || undefined,
        notes:          notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      // Інвалідуємо бронювання тижня, щоб шахматка оновилась
      qc.invalidateQueries({ queryKey: ['schedule', 'bookings', salonId] });
      onSuccess?.();
    },
  });

  // ── Derived helpers ───────────────────────────────────────────────────────
  const selectedEmployee = employees.find((e) => e.id === slot?.employeeId);

  const canSubmit =
    !!selectedServiceId &&
    clientPhone.trim().length >= 10 &&
    !mutation.isPending;

  return {
    // Form fields
    selectedServiceId, setSelectedServiceId,
    clientPhone, handlePhoneChange,
    clientFirstName, setClientFirstName,
    notes, setNotes,

    // Client search
    clientSuggestions,
    selectedClient,
    pickClient,
    searchLoading,

    // Data
    employeeServices,
    servicesLoading,
    selectedEmployee,

    // Conflict
    conflict,

    // Mutation
    submit: mutation.mutate,
    isSubmitting: mutation.isPending,
    submitError: mutation.error,

    canSubmit,
  };
}
