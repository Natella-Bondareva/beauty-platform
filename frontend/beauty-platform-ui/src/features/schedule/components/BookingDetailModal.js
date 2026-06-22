import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '../api/schedule.api';
import { accent, peach, inputStyle } from '../../../shared/ui/tokens';

const UA_MONTH = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];

const STATUS_STYLE = {
  0: { bg: '#fef9c3', border: '#fbbf24', text: '#92400e' },
  1: { bg: '#dbeafe', border: '#60a5fa', text: '#1e40af' },
  2: { bg: '#dcfce7', border: '#4ade80', text: '#166534' },
  3: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
  4: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
  5: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
};

const STATUS_LABEL = {
  0: 'Очікує',
  1: 'Підтверджено',
  2: 'Завершено',
  3: 'Протерміновано',
  4: 'Скасовано',
  5: "Не з'явився",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(utcStr) {
  if (!utcStr) return '';
  const d = new Date(utcStr);
  return `${d.getDate()} ${UA_MONTH[d.getMonth()]}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function formatTime(utcStr) {
  if (!utcStr) return '';
  const d = new Date(utcStr);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ name, url, size = 40 }) {
  if (url) return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  const initial = (name || '?').charAt(0).toUpperCase();
  const hue = [...(name || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},50%,60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.4, userSelect: 'none', flexShrink: 0 }}>
      {initial}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
      {children}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0, paddingTop: 2 }}>{label}</span>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', textAlign: 'right', wordBreak: 'break-word' }}>{children}</div>
    </div>
  );
}

function FieldAnswer({ answer }) {
  return (
    <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>
        {answer.label}
      </div>
      {answer.fileUrl ? (
        /\.(jpg|jpeg|png|gif|webp)$/i.test(answer.fileUrl) ? (
          <img src={answer.fileUrl} alt={answer.label} style={{ maxWidth: '100%', borderRadius: 8 }} />
        ) : (
          <a href={answer.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: accent, fontWeight: 600, textDecoration: 'none' }}>
            📎 Відкрити файл
          </a>
        )
      ) : (
        <div style={{ fontSize: 14, color: '#1E293B', fontWeight: 500 }}>{answer.textValue || '—'}</div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BookingDetailModal({ bookingId, onClose }) {
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const qc = useQueryClient();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking-detail', bookingId],
    queryFn: () => scheduleApi.getBookingById(bookingId).then(r => r.data),
    enabled: !!bookingId,
    staleTime: 30_000,
  });

  const cancelMutation = useMutation({
    mutationFn: () => scheduleApi.cancelBooking(bookingId, cancelReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schedule', 'bookings'] });
      onClose();
    },
  });

  const statusStyle = STATUS_STYLE[booking?.status ?? 1];
  const canCancel   = booking && [0, 1].includes(booking.status);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 201,
        transform: 'translate(-50%, -50%)',
        width: 460, maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 48px)',
        background: '#fff', borderRadius: 18,
        boxShadow: '0 8px 48px rgba(15,23,42,0.22)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          background: 'linear-gradient(135deg, #FFF5F0, #FFE8DA)',
          borderBottom: `1px solid ${peach}`,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#1E293B' }}>Деталі запису</div>
            {booking && (
              <span style={{
                display: 'inline-block', marginTop: 6,
                padding: '3px 10px', borderRadius: 12,
                fontSize: 12, fontWeight: 700,
                background: statusStyle.border + '22', color: statusStyle.text,
              }}>
                {STATUS_LABEL[booking.status]}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, border: `1px solid ${peach}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 18, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
              <div style={{ fontSize: 28 }}>⏳</div>
              <div style={{ marginTop: 8, fontSize: 13 }}>Завантаження...</div>
            </div>
          )}

          {isError && (
            <div style={{ textAlign: 'center', padding: 48, color: '#ef4444', fontSize: 13 }}>
              Не вдалося завантажити деталі запису
            </div>
          )}

          {booking && (
            <>
              {/* ── Клієнт ── */}
              <div style={{ marginBottom: 20 }}>
                <SectionTitle>Клієнт</SectionTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <Avatar name={booking.client?.fullName || booking.client?.phone} size={46} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
                      {booking.client?.fullName || 'Без імені'}
                    </div>
                    <a
                      href={`tel:${booking.client?.phone}`}
                      style={{ fontSize: 13, color: accent, fontWeight: 600, textDecoration: 'none' }}
                    >
                      {booking.client?.phone}
                    </a>
                    {booking.client?.noShowCount > 0 && (
                      <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>
                        ⚠ {booking.client.noShowCount} пропущених
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Запис ── */}
              <div style={{ marginBottom: 20 }}>
                <SectionTitle>Запис</SectionTitle>
                <InfoRow label="Послуга">{booking.service?.name}</InfoRow>
                <InfoRow label="Майстер">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                    <Avatar name={booking.employee?.fullName} url={booking.employee?.avatarUrl} size={22} />
                    {booking.employee?.fullName}
                  </div>
                </InfoRow>
                <InfoRow label="Час">
                  {formatDateTime(booking.startTimeUtc)} – {formatTime(booking.endTimeUtc)}
                </InfoRow>
                <InfoRow label="Тривалість">{booking.service?.clientDurationMinutes} хв</InfoRow>
                <InfoRow label="Ціна">
                  <span style={{ color: accent, fontWeight: 800 }}>{booking.price} ₴</span>
                </InfoRow>
                {booking.cancellationReason && (
                  <InfoRow label="Причина скасування">
                    <span style={{ color: '#ef4444' }}>{booking.cancellationReason}</span>
                  </InfoRow>
                )}
              </div>

              {/* ── Примітки клієнта (field answers) ── */}
              {booking.fieldAnswers?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <SectionTitle>Примітки клієнта</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {booking.fieldAnswers.map(a => <FieldAnswer key={a.bookingFieldId} answer={a} />)}
                  </div>
                </div>
              )}

              {/* ── Скасувати ── */}
              {canCancel && (
                cancelMode ? (
                  <div style={{ padding: 14, background: '#fff7ed', borderRadius: 12, border: '1.5px solid #fed7aa' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 10 }}>
                      Вкажіть причину скасування
                    </div>
                    <textarea
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      placeholder="Причина скасування..."
                      rows={2}
                      style={{ ...inputStyle, resize: 'none', marginBottom: 10 }}
                    />
                    {cancelMutation.isError && (
                      <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 8 }}>
                        Помилка. Спробуйте ще раз.
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => { setCancelMode(false); setCancelReason(''); }}
                        style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${peach}`, background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#64748b' }}
                      >
                        Назад
                      </button>
                      <button
                        onClick={() => cancelMutation.mutate()}
                        disabled={!cancelReason.trim() || cancelMutation.isPending}
                        style={{
                          flex: 2, padding: '8px', borderRadius: 8, border: 'none',
                          background: cancelReason.trim() ? '#ef4444' : '#e2e8f0',
                          color: cancelReason.trim() ? '#fff' : '#94a3b8',
                          cursor: cancelReason.trim() ? 'pointer' : 'not-allowed',
                          fontSize: 13, fontWeight: 700,
                        }}
                      >
                        {cancelMutation.isPending ? 'Скасовуємо...' : 'Підтвердити'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCancelMode(true)}
                    style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #fca5a5', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Скасувати запис
                  </button>
                )
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${peach}`, background: '#fafafa', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: `1.5px solid ${peach}`, background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#64748b' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F0')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Закрити
          </button>
        </div>
      </div>
    </>
  );
}
