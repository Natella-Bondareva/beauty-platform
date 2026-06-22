import { useState, useCallback } from 'react';
import { bookingApi } from '../api/booking.api';

const TOTAL_STEPS = 7;

const INITIAL_STATE = {
  step: 1,
  selectedService: null,
  selectedEmployee: null,  // null = "будь-який майстер"
  selectedDate: null,      // ISO рядок "2026-05-05"
  selectedSlot: null,      // { startTimeUtc, endTimeUtc, startTimeLocal, endTimeLocal, employeeId, employeeName, price }
  contact: { phone: '', firstName: '' },
  bookingFields: [],       // BookingFieldDto[] — завантажуються після contact
  fieldAnswers: {},        // { [fieldId]: { textValue?, fileUrl? } }
  bookingId: null,
  expiresAt: null,
};

function storageKey(salonId) {
  return `booking_wizard_${salonId}`;
}

function loadState(salonId) {
  try {
    const raw = sessionStorage.getItem(storageKey(salonId));
    return raw ? JSON.parse(raw) : INITIAL_STATE;
  } catch {
    return INITIAL_STATE;
  }
}

export function useBookingWizard(salonId) {
  const [state, setState] = useState(() => loadState(salonId));
  const [fieldsLoading, setFieldsLoading] = useState(false);

  const persist = (next) => {
    try {
      sessionStorage.setItem(storageKey(salonId), JSON.stringify(next));
    } catch { /* ignore */ }
    return next;
  };

  const update = useCallback((patch) => {
    setState((prev) => persist({ ...prev, ...patch }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectService = useCallback((service) => {
    setState((prev) => persist({
      ...prev,
      step: 2,
      selectedService: service,
      selectedEmployee: null,
      selectedDate: null,
      selectedSlot: null,
      bookingFields: [],
      fieldAnswers: {},
      bookingId: null,
      expiresAt: null,
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectEmployee = useCallback((employee) => {
    setState((prev) => persist({
      ...prev,
      step: 3,
      selectedEmployee: employee,
      selectedDate: null,
      selectedSlot: null,
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectSlot = useCallback((slot) => {
    setState((prev) => persist({ ...prev, step: 4, selectedSlot: slot }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setContact = useCallback((contact) => {
    setState((prev) => persist({ ...prev, contact }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Після заповнення контактів — завантажуємо поля форми
  const advanceToConfirm = useCallback(async () => {
    setFieldsLoading(true);
    try {
      const res = await bookingApi.getBookingFields(
        salonId,
        state.selectedService?.id,
        state.selectedSlot?.employeeId,
      );
      const fields = res.data || [];
      if (fields.length > 0) {
        // є додаткові поля — крок 5
        setState((prev) => persist({ ...prev, step: 5, bookingFields: fields }));
      } else {
        // немає полів — одразу на підтвердження (крок 6)
        setState((prev) => persist({ ...prev, step: 6, bookingFields: [] }));
      }
    } catch {
      // помилка завантаження — пропускаємо крок полів
      setState((prev) => persist({ ...prev, step: 6, bookingFields: [] }));
    } finally {
      setFieldsLoading(false);
    }
  }, [salonId, state.selectedService?.id, state.selectedSlot?.employeeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const setFieldAnswer = useCallback((fieldId, value) => {
    setState((prev) => persist({
      ...prev,
      fieldAnswers: { ...prev.fieldAnswers, [fieldId]: value },
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Після заповнення додаткових полів — крок підтвердження
  const advanceFromFields = useCallback(() => {
    setState((prev) => persist({ ...prev, step: 6 }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setBookingResult = useCallback(({ bookingId, expiresAt }) => {
    setState((prev) => persist({ ...prev, step: 7, bookingId, expiresAt }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.step <= 1) return prev;
      // Якщо повертаємось з підтвердження і поля були пропущені
      if (prev.step === 6 && prev.bookingFields.length === 0) {
        return persist({ ...prev, step: 4 });
      }
      return persist({ ...prev, step: prev.step - 1 });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    try { sessionStorage.removeItem(storageKey(salonId)); } catch { /* ignore */ }
  }, [salonId]);

  return {
    ...state,
    totalSteps: state.bookingFields.length > 0 ? TOTAL_STEPS : TOTAL_STEPS - 1,
    fieldsLoading,
    selectService,
    selectEmployee,
    selectSlot,
    setContact,
    advanceToConfirm,
    setFieldAnswer,
    advanceFromFields,
    setBookingResult,
    goBack,
    reset,
    update,
  };
}
