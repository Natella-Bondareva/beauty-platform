import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { bookingApi } from '../api/booking.api';
import { Avatar } from '../../../shared/ui/Avatar';
import Icon from '../../../components/dashboard/Icon';

const accent = '#D57A66';
const peach = '#FFD1B3';

const MONTH_NAMES = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
];

function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T00:00:00');
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function Row({ icon, label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 0',
        borderBottom: `1px solid ${peach}`,
      }}
    >
      <Icon name={icon} size={18} color="#94a3b8" />
      <div>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: '#1E293B', fontWeight: 500, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

export default function StepConfirm({
  salonId,
  selectedService,
  selectedEmployee,
  selectedSlot,
  contact,
  fieldAnswers,
  onSuccess,
}) {
  const bookingMutation = useMutation({
    mutationFn: () => {
      const payload = {
        salonId,
        serviceId: selectedService.id,
        employeeId: selectedSlot.employeeId,
        startTimeUtc: selectedSlot.startTimeUtc,
        clientPhone: contact.phone.trim(),
        clientFirstName: contact.firstName.trim() || null,
        clientLastName: null,
        fieldAnswers: Object.entries(fieldAnswers || {}).map(([bookingFieldId, val]) => ({
          bookingFieldId,
          textValue: val.textValue ?? null,
          fileUrl: val.fileUrl ?? null,
        })),
      };
      return bookingApi.createBooking(salonId, payload).then((r) => r.data);
    },
    onSuccess: (data) => {
      onSuccess({ bookingId: data.bookingId, expiresAt: data.expiresAt });
    },
  });

  const dateLabel = selectedSlot
    ? `${formatDate(selectedSlot.startTimeUtc?.slice(0, 10))} о ${selectedSlot.startTimeLocal}`
    : '';

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
        Підтвердіть запис
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
        Крок 5 з 6 · Перевірте деталі перед підтвердженням
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          border: `1px solid ${peach}`,
          padding: '4px 20px 4px',
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(213,122,102,0.07)',
        }}
      >
        <Row icon="scissors" label="Послуга" value={selectedService?.name} />
        <Row
          icon="users"
          label="Майстер"
          value={
            selectedSlot?.employeeName
              ? selectedSlot.employeeName
              : selectedEmployee?.fullName ?? 'Будь-який майстер'
          }
        />
        <Row icon="calendar" label="Дата та час" value={dateLabel} />
        <Row icon="clock" label="Тривалість" value={`${selectedService?.clientDurationMinutes} хв`} />
        <Row
          icon="dollar"
          label="Вартість"
          value={selectedSlot?.price ? `${selectedSlot.price} ₴` : `${selectedService?.price} ₴`}
        />
        <Row icon="phone" label="Телефон" value={contact.phone} />
        {contact.firstName && (
          <div style={{ padding: '12px 0', borderBottom: `1px solid ${peach}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="person" size={18} color="#94a3b8" />
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Ім'я
                </div>
                <div style={{ fontSize: 14, color: '#1E293B', fontWeight: 500, marginTop: 2 }}>
                  {contact.firstName}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {bookingMutation.isError && (
        <div
          style={{
            fontSize: 13,
            color: '#ef4444',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 16,
          }}
        >
          {bookingMutation.error?.response?.data?.message ?? 'Помилка при створенні запису. Спробуйте знову.'}
        </div>
      )}

      <button
        onClick={() => bookingMutation.mutate()}
        disabled={bookingMutation.isPending}
        style={{
          width: '100%',
          padding: '13px',
          borderRadius: 12,
          border: 'none',
          background: 'var(--gradient-primary)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          cursor: bookingMutation.isPending ? 'not-allowed' : 'pointer',
          opacity: bookingMutation.isPending ? 0.7 : 1,
          boxShadow: '0 4px 12px rgba(213,122,102,0.3)',
          transition: 'opacity 0.15s',
        }}
      >
        {bookingMutation.isPending ? 'Відправляємо…' : 'Підтвердити запис'}
      </button>

    </div>
  );
}
