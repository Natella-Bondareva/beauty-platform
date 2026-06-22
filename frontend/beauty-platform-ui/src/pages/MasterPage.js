import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masterApi } from '../features/master/api/master.api';
import { useAuthStore } from '../features/auth/store/authStore';

// ── BookingDetailPanel (slide-up від низу) ────────────────────────────────────

function FieldAnswer({ answer }) {
  return (
    <div style={{ padding: '10px 14px', background: '#fff5f0', borderRadius: 10, border: '1px solid #FFD1B3' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>
        {answer.label}
      </div>
      {answer.fileUrl ? (
        /\.(jpg|jpeg|png|gif|webp)$/i.test(answer.fileUrl) ? (
          <img src={answer.fileUrl} alt={answer.label} style={{ maxWidth: '100%', borderRadius: 8 }} />
        ) : (
          <a href={answer.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#D57A66', fontWeight: 600, textDecoration: 'none' }}>
            📎 Відкрити файл
          </a>
        )
      ) : (
        <div style={{ fontSize: 14, color: '#1E293B', fontWeight: 500 }}>{answer.textValue || '—'}</div>
      )}
    </div>
  );
}

function BookingDetailPanel({ bookingId, salonId, onClose }) {
  const qc = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking-detail', bookingId],
    queryFn: () => masterApi.getBookingById(bookingId).then(r => r.data),
    enabled: !!bookingId,
    staleTime: 30_000,
  });

  const completeMutation = useMutation({
    mutationFn: () => masterApi.completeBooking(bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master', 'bookings', salonId] });
      onClose();
    },
  });

  const canComplete = booking?.status === 1;

  const panelAccent = '#D57A66';
  const panelPeach  = '#FFD1B3';

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.4)' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
        background: '#fff', borderRadius: '20px 20px 0 0',
        maxHeight: '82vh', overflowY: 'auto',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
        padding: '0 0 32px',
      }}>
        {/* Drag handle */}
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0' }} />
        </div>

        {isLoading && (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
            <div style={{ fontSize: 24 }}>⏳</div>
            <div style={{ marginTop: 8, fontSize: 13 }}>Завантаження...</div>
          </div>
        )}

        {booking && (
          <div style={{ padding: '8px 20px 0' }}>
            {/* Послуга + статус */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#1E293B', flex: 1 }}>
                {booking.service?.name}
              </div>
              {(() => {
                const s = STATUS_COLOR[booking.status] ?? STATUS_COLOR[1];
                return (
                  <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: s.bg, color: s.text, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {STATUS_LABEL[booking.status]}
                  </span>
                );
              })()}
            </div>

            {/* Три плитки: час, тривалість, ціна */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'ЧАС', value: new Date(booking.startTimeUtc).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) },
                { label: 'ТРИВАЛІСТЬ', value: `${booking.service?.clientDurationMinutes} хв` },
                { label: 'ЦІНА', value: `${booking.price} ₴`, color: panelAccent },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ flex: 1, padding: '10px 6px', background: '#f8fafc', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.4px', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: color ?? '#1E293B' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Клієнт */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Клієнт
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8fafc', borderRadius: 12 }}>
                <Avatar name={booking.client?.fullName || booking.client?.phone} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>
                    {booking.client?.fullName || 'Без імені'}
                  </div>
                  <a href={`tel:${booking.client?.phone}`} style={{ fontSize: 13, color: panelAccent, fontWeight: 600, textDecoration: 'none' }}>
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

            {/* Примітки клієнта (field answers) */}
            {booking.fieldAnswers?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Примітки клієнта
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {booking.fieldAnswers.map(a => <FieldAnswer key={a.bookingFieldId} answer={a} />)}
                </div>
              </div>
            )}

            {/* Дії */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={onClose}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: `1.5px solid ${panelPeach}`, background: 'transparent', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Закрити
              </button>
              {canComplete && (
                <button
                  onClick={() => completeMutation.mutate()}
                  disabled={completeMutation.isPending}
                  style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#FFD1B3,#D57A66)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(213,122,102,0.3)' }}
                >
                  {completeMutation.isPending ? 'Завершуємо...' : '✓ Завершити'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const accent = '#D57A66';
const peach  = '#FFD1B3';
const bg     = '#FFF5F0';

// ── Constants ─────────────────────────────────────────────────────────────────
const UA_DAYS_FULL  = ['Неділя','Понеділок','Вівторок','Середа','Четвер','П\'ятниця','Субота'];
const UA_DAYS_SHORT = ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'];
const UA_MONTH      = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];
const UA_MONTH_SHORT = ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жов','Лис','Гру'];

const STATUS_LABEL = {
  0: 'Очікує',
  1: 'Підтверджено',
  2: 'Завершено',
  3: 'Протерміновано',
  4: 'Скасовано',
  5: 'Не з\'явився',
};

const STATUS_COLOR = {
  0: { bg: '#fef9c3', border: '#fbbf24', text: '#92400e' },
  1: { bg: '#dbeafe', border: '#60a5fa', text: '#1e40af' },
  2: { bg: '#dcfce7', border: '#4ade80', text: '#166534' },
  3: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
  4: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
  5: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(date) {
  const mon = getMondayOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function formatDateLabel(date) {
  return `${UA_DAYS_FULL[date.getDay()]}, ${date.getDate()} ${UA_MONTH[date.getMonth()]}`;
}

function timeSpanToMins(ts) {
  if (!ts) return 0;
  const [h, m] = ts.split(':');
  return parseInt(h) * 60 + parseInt(m);
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, size = 40, url }) {
  if (url) return (
    <img src={url} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  );
  const initial = (name || '?').charAt(0).toUpperCase();
  const hue = [...(name || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue},55%,58%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.4, userSelect: 'none',
    }}>{initial}</div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '12px 0', border: 'none',
        borderBottom: `3px solid ${active ? accent : 'transparent'}`,
        background: 'transparent',
        color: active ? accent : '#94a3b8',
        fontWeight: active ? 700 : 500,
        fontSize: 14, cursor: 'pointer',
        transition: 'all 0.18s',
      }}
    >{children}</button>
  );
}

// ── Booking card ──────────────────────────────────────────────────────────────

function BookingCard({ booking, onComplete, onOpen }) {
  const style   = STATUS_COLOR[booking.status] ?? STATUS_COLOR[1];
  const canComplete = booking.status === 1; // Confirmed

  return (
    <div
      onClick={() => onOpen?.(booking.id)}
      style={{
        marginBottom: 12,
        background: '#fff',
        border: `1.5px solid ${style.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        cursor: 'pointer',
      }}
    >
      {/* Time bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: style.bg,
        borderBottom: `1px solid ${style.border}`,
      }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: style.text }}>
          {booking.startTimeLocal} – {booking.endTimeLocal}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: '2px 8px', borderRadius: 20,
          background: style.border + '33',
          color: style.text,
        }}>
          {STATUS_LABEL[booking.status]}
        </span>
      </div>

      {/* Details */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={booking.clientName || booking.clientPhone} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {booking.clientName || 'Без імені'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{booking.clientPhone}</div>
          </div>
          {booking.clientNoShowCount > 0 && (
            <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, whiteSpace: 'nowrap' }}>
              ⚠ {booking.clientNoShowCount} пропущ.
            </span>
          )}
        </div>

        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {booking.serviceName}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              {booking.clientDurationMinutes} хв · {booking.price} ₴
            </div>
          </div>
          {canComplete && (
            <button
              onClick={(e) => { e.stopPropagation(); onComplete(booking.id); }}
              style={{
                padding: '7px 16px', borderRadius: 10, border: 'none', flexShrink: 0,
                background: 'var(--gradient-primary)', color: '#fff',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(213,122,102,0.3)',
              }}
            >✓ Завершено</button>
          )}
        </div>

        {/* Питання і відповіді клієнта */}
        {booking.fieldAnswers?.length > 0 && (
          <div style={{
            marginTop: 10, paddingTop: 10,
            borderTop: '1px dashed #FFD1B3',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
              Примітки клієнта
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {booking.fieldAnswers.map(a => (
                <div key={a.bookingFieldId}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{a.label}</div>
                  {a.fileUrl ? (
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(a.fileUrl) ? (
                      <img src={a.fileUrl} alt={a.label} style={{ marginTop: 3, maxWidth: '100%', borderRadius: 6 }} />
                    ) : (
                      <a
                        href={a.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: 12, color: accent, fontWeight: 600, textDecoration: 'none' }}
                      >📎 Файл</a>
                    )
                  ) : (
                    <div style={{ fontSize: 13, color: '#1E293B', fontWeight: 500, marginTop: 1 }}>
                      {a.textValue || '—'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 1: Today ──────────────────────────────────────────────────────────────

function TodayTab({ salonId }) {
  const qc = useQueryClient();
  const today = toIsoDate(new Date());
  const [detailBookingId, setDetailBookingId] = useState(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['master', 'bookings', salonId, today],
    queryFn: () => masterApi.getMyBookings(salonId, { date: today }).then(r => r.data),
    enabled: !!salonId,
  });

  const completeMutation = useMutation({
    mutationFn: (bookingId) => masterApi.completeBooking(bookingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['master', 'bookings', salonId] }),
  });

  if (isLoading) return <LoadingState />;

  const now = new Date();
  const upcoming = bookings.filter(b => new Date(b.startTimeUtc) >= now && b.status !== 2);
  const past     = bookings.filter(b => new Date(b.startTimeUtc) < now || b.status === 2);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
        {formatDateLabel(new Date())}
      </div>

      {bookings.length === 0 && (
        <EmptyState icon="📅" text="На сьогодні записів немає" sub="Відпочивайте або перевірте розклад" />
      )}

      {upcoming.length > 0 && (
        <>
          <SectionLabel>Наступні</SectionLabel>
          {upcoming.map(b => (
            <BookingCard
              key={b.id}
              booking={b}
              onComplete={id => completeMutation.mutate(id)}
              onOpen={setDetailBookingId}
            />
          ))}
        </>
      )}

      {past.length > 0 && (
        <>
          <SectionLabel>Минулі</SectionLabel>
          {past.map(b => (
            <BookingCard
              key={b.id}
              booking={b}
              onComplete={id => completeMutation.mutate(id)}
              onOpen={setDetailBookingId}
            />
          ))}
        </>
      )}

      {detailBookingId && (
        <BookingDetailPanel
          bookingId={detailBookingId}
          salonId={salonId}
          onClose={() => setDetailBookingId(null)}
        />
      )}
    </div>
  );
}

// ── Tab 2: Week ───────────────────────────────────────────────────────────────

function WeekTab({ salonId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekDays = getWeekDays(selectedDate);
  const [dayView, setDayView]           = useState(null); // Date | null
  const [detailBookingId, setDetailBookingId] = useState(null);
  const qc = useQueryClient();

  const mon = getMondayOfWeek(selectedDate);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const dateFrom = toIsoDate(mon);
  const dateTo   = toIsoDate(sun);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['master', 'bookings', salonId, dateFrom, dateTo],
    queryFn: () => masterApi.getMyBookings(salonId, { dateFrom, dateTo }).then(r => r.data),
    enabled: !!salonId,
  });

  const completeMutation = useMutation({
    mutationFn: (bookingId) => masterApi.completeBooking(bookingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['master', 'bookings', salonId] }),
  });

  // Count bookings per day
  const countByDay = weekDays.map(d =>
    bookings.filter(b => isSameDay(new Date(b.startTimeUtc), d)
      && b.status !== 4 && b.status !== 3).length
  );

  const today = new Date();

  // If a specific day is selected, show its bookings
  const dayBookings = dayView
    ? bookings.filter(b => isSameDay(new Date(b.startTimeUtc), dayView))
    : [];

  return (
    <div>
      {/* Week navigation */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${peach}` }}>
        <button onClick={() => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate()-7); return n; })}
          style={navBtnStyle}>‹</button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
          {mon.getDate()} {UA_MONTH_SHORT[mon.getMonth()]} – {sun.getDate()} {UA_MONTH_SHORT[sun.getMonth()]}
        </span>
        <button onClick={() => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate()+7); return n; })}
          style={navBtnStyle}>›</button>
      </div>

      {/* Day strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: `1px solid ${peach}`, background: bg }}>
        {weekDays.map((d, i) => {
          const isToday   = isSameDay(d, today);
          const isSelected = dayView && isSameDay(d, dayView);
          const count     = countByDay[i];

          return (
            <button
              key={i}
              onClick={() => setDayView(isSelected ? null : d)}
              style={{
                padding: '10px 4px', border: 'none',
                borderBottom: `3px solid ${isSelected ? accent : 'transparent'}`,
                background: isToday ? 'linear-gradient(135deg,#FFD1B3,#D57A66)' : 'transparent',
                cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? 'rgba(255,255,255,0.85)' : '#94a3b8', textTransform: 'uppercase' }}>
                {UA_DAYS_SHORT[(i + 1) % 7] /* Mon=0 in our array, adjust for Sun=0 JS */
                  || UA_DAYS_SHORT[i]}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: isToday ? '#fff' : '#1E293B', lineHeight: 1.1 }}>
                {d.getDate()}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: isToday ? 'rgba(255,255,255,0.9)' : (count > 0 ? accent : '#cbd5e1'), marginTop: 2 }}>
                {count > 0 ? `${count} зап` : '—'}
              </div>
            </button>
          );
        })}
      </div>

      {isLoading && <LoadingState />}

      {/* Day bookings */}
      {dayView && !isLoading && (
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            {formatDateLabel(dayView)}
          </div>
          {dayBookings.length === 0 ? (
            <EmptyState icon="📋" text="Записів немає" sub="У цей день вільно" />
          ) : (
            dayBookings.map(b => (
              <BookingCard
                key={b.id}
                booking={b}
                onComplete={id => completeMutation.mutate(id)}
                onOpen={setDetailBookingId}
              />
            ))
          )}
        </div>
      )}

      {!dayView && !isLoading && (
        <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
          Натисніть на день, щоб побачити записи
        </div>
      )}

      {detailBookingId && (
        <BookingDetailPanel
          bookingId={detailBookingId}
          salonId={salonId}
          onClose={() => setDetailBookingId(null)}
        />
      )}
    </div>
  );
}

// ── Tab 3: Schedule ───────────────────────────────────────────────────────────

const UA_DAY_OF_WEEK = ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'];

function ScheduleTab({ salonId }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [addBreakDay, setAddBreakDay] = useState(null);

  const { data: constraints, isLoading } = useQuery({
    queryKey: ['master', 'schedule-constraints', salonId],
    queryFn: () => masterApi.getMyScheduleConstraints(salonId).then(r => r.data),
    enabled: !!salonId,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (constraints && !draft) {
      setDraft(constraints.currentSchedule.map(s => ({ ...s })));
    }
  }, [constraints]);

  const saveSchedule = async () => {
    setSaving(true);
    try {
      await masterApi.setMySchedule(salonId, draft);
      qc.invalidateQueries({ queryKey: ['master', 'schedule-constraints', salonId] });
      setEditing(false);
    } catch (e) {
      alert('Помилка збереження: ' + (e?.response?.data?.title || e.message));
    } finally {
      setSaving(false);
    }
  };

  const updateDay = (idx, field, value) => {
    setDraft(prev => prev.map((d, i) =>
      i === idx ? { ...d, [field]: value } : d
    ));
  };

  if (isLoading || !draft) return <LoadingState />;

  const opening = constraints?.salonOpeningTime ?? '09:00:00';
  const closing = constraints?.salonClosingTime ?? '20:00:00';

  return (
    <div style={{ padding: '16px' }}>
      {/* Salon hours notice */}
      <div style={{
        marginBottom: 16, padding: '10px 14px',
        background: bg, border: `1px solid ${peach}`, borderRadius: 10,
        fontSize: 12, color: '#64748b',
      }}>
        Години роботи салону: <strong>{opening.slice(0,5)} – {closing.slice(0,5)}</strong>
      </div>

      {/* Schedule rows */}
      {draft.map((day, idx) => (
        <div
          key={day.dayOfWeek}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', marginBottom: 8,
            background: '#fff', borderRadius: 12,
            border: `1.5px solid ${day.isWorking ? peach : '#f1f5f9'}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ width: 28, fontWeight: 700, fontSize: 13, color: '#1E293B' }}>
            {UA_DAY_OF_WEEK[day.dayOfWeek]}
          </div>

          {day.isWorking ? (
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="time" value={day.startTime?.slice(0, 5) ?? '09:00'}
                    min={opening.slice(0, 5)} max={closing.slice(0, 5)}
                    onChange={e => updateDay(idx, 'startTime', e.target.value + ':00')}
                    style={timeInputStyle}
                  />
                  <span style={{ color: '#94a3b8' }}>–</span>
                  <input
                    type="time" value={day.endTime?.slice(0, 5) ?? '18:00'}
                    min={opening.slice(0, 5)} max={closing.slice(0, 5)}
                    onChange={e => updateDay(idx, 'endTime', e.target.value + ':00')}
                    style={timeInputStyle}
                  />
                </div>
              ) : (
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                  {day.startTime?.slice(0, 5)} – {day.endTime?.slice(0, 5)}
                </span>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
              вихідний
            </div>
          )}

          {editing && (
            <button
              onClick={() => updateDay(idx, 'isWorking', !day.isWorking)}
              style={{
                width: 36, height: 22, borderRadius: 11, border: 'none',
                background: day.isWorking ? accent : '#e2e8f0',
                cursor: 'pointer', transition: 'all 0.18s', flexShrink: 0,
                position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 3, left: day.isWorking ? 16 : 3,
                width: 16, height: 16, borderRadius: '50%',
                background: '#fff', transition: 'all 0.18s',
              }} />
            </button>
          )}

          {!editing && day.isWorking && (
            <button
              onClick={() => setAddBreakDay(day.dayOfWeek)}
              style={{ fontSize: 11, color: '#94a3b8', border: `1px solid #e2e8f0`, borderRadius: 6, padding: '3px 8px', background: 'transparent', cursor: 'pointer' }}
              title="Додати перерву"
            >+ перерва</button>
          )}
        </div>
      ))}

      {/* Edit / Save buttons */}
      {editing ? (
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={() => { setEditing(false); setDraft(constraints.currentSchedule.map(s => ({...s}))); }}
            style={{ ...outlineBtnStyle, flex: 1 }}>Скасувати</button>
          <button onClick={saveSchedule} disabled={saving}
            style={{ ...primaryBtnStyle, flex: 2 }}>
            {saving ? 'Зберігаємо...' : '✓ Зберегти розклад'}
          </button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} style={{ ...outlineBtnStyle, width: '100%', marginTop: 16 }}>
          ✏ Редагувати розклад
        </button>
      )}

      {/* Add break inline modal */}
      {addBreakDay !== null && (
        <AddBreakPanel
          salonId={salonId}
          dayOfWeek={addBreakDay}
          schedule={draft?.find(d => d.dayOfWeek === addBreakDay)}
          onClose={() => setAddBreakDay(null)}
          onSaved={() => setAddBreakDay(null)}
        />
      )}
    </div>
  );
}

// ── Add break panel ───────────────────────────────────────────────────────────

function AddBreakPanel({ salonId, dayOfWeek, schedule, onClose, onSaved }) {
  const [startTime, setStartTime] = useState('13:00');
  const [endTime,   setEndTime]   = useState('14:00');
  const [reason,    setReason]    = useState('Обід');
  const [error,     setError]     = useState(null);
  const [saving,    setSaving]    = useState(false);

  // Compute the next date for this day-of-week
  const nextDate = (() => {
    const today = new Date();
    const diff  = (dayOfWeek - today.getDay() + 7) % 7;
    const d     = new Date(today);
    d.setDate(today.getDate() + (diff === 0 ? 0 : diff));
    return toIsoDate(d);
  })();

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await masterApi.addMyBreak(salonId, {
        date: nextDate,
        startTime: startTime + ':00',
        endTime:   endTime   + ':00',
        reason,
      });
      onSaved();
    } catch (e) {
      setError(e?.response?.data?.title || e?.response?.data || 'Помилка');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(15,23,42,0.4)' }} />
      <div style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:101,
        background:'#fff', borderRadius:'18px 18px 0 0',
        padding:'20px 20px 32px', boxShadow:'0 -8px 32px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontSize:16, fontWeight:800, marginBottom:16 }}>
          Перерва — {UA_DAY_OF_WEEK[dayOfWeek]}
        </div>

        <div style={{ display:'flex', gap:10, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <div style={fieldLabel}>Початок</div>
            <input type="time" value={startTime}
              min={schedule?.startTime?.slice(0,5)} max={schedule?.endTime?.slice(0,5)}
              onChange={e => setStartTime(e.target.value)}
              style={timeInputStyle} />
          </div>
          <div style={{ flex:1 }}>
            <div style={fieldLabel}>Кінець</div>
            <input type="time" value={endTime}
              min={schedule?.startTime?.slice(0,5)} max={schedule?.endTime?.slice(0,5)}
              onChange={e => setEndTime(e.target.value)}
              style={timeInputStyle} />
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={fieldLabel}>Причина</div>
          <input value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Обід, нарада..."
            style={{ ...timeInputStyle, width:'100%', boxSizing:'border-box' }} />
        </div>

        {error && <div style={{ color:'#ef4444', fontSize:12, marginBottom:10 }}>{error}</div>}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ ...outlineBtnStyle, flex:1 }}>Скасувати</button>
          <button onClick={save} disabled={saving} style={{ ...primaryBtnStyle, flex:2 }}>
            {saving ? 'Додаємо...' : '+ Додати перерву'}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
      <div style={{ fontSize: 14 }}>Завантаження...</div>
    </div>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>{text}</div>
      {sub && <div style={{ fontSize: 13, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: '#94a3b8',
      textTransform: 'uppercase', letterSpacing: '0.5px',
      marginBottom: 8, marginTop: 4,
    }}>{children}</div>
  );
}

const navBtnStyle = {
  width: 34, height: 34, border: `1px solid ${peach}`, borderRadius: 8,
  background: '#fff', cursor: 'pointer', fontSize: 18,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#64748b',
};

const timeInputStyle = {
  padding: '8px 10px', borderRadius: 8, fontSize: 14, fontWeight: 600,
  border: `1.5px solid ${peach}`, background: '#fff', color: '#1E293B',
  outline: 'none',
};

const primaryBtnStyle = {
  padding: '12px 0', borderRadius: 12, border: 'none',
  background: 'var(--gradient-primary)', color: '#fff',
  fontSize: 14, fontWeight: 700, cursor: 'pointer',
  boxShadow: '0 2px 10px rgba(213,122,102,0.3)',
};

const outlineBtnStyle = {
  padding: '12px 0', borderRadius: 12,
  border: `1.5px solid ${peach}`, background: 'transparent',
  color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer',
};

const fieldLabel = {
  fontSize: 11, fontWeight: 700, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.4px',
  marginBottom: 5,
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MasterPage() {
  const navigate = useNavigate();
  const { salonId, clearAuth } = useAuthStore();
  const [tab, setTab] = useState('today');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['master', 'profile', salonId],
    queryFn: () => masterApi.getMyProfile(salonId).then(r => r.data),
    enabled: !!salonId,
  });

  if (!salonId) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh', background: bg,
      display: 'flex', flexDirection: 'column',
      maxWidth: 480, margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #FFD1B3 0%, #D57A66 100%)',
        padding: '20px 20px 16px',
        boxShadow: '0 4px 16px rgba(213,122,102,0.25)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              name={profile?.fullName}
              url={profile?.avatarUrl}
              size={46}
            />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                {profileLoading ? '...' : (profile?.fullName ?? 'Майстер')}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                {profile?.categories?.map(c => c.name).join(', ') || ''}
              </div>
            </div>
          </div>

          <button
            onClick={() => { clearAuth(); navigate('/login'); }}
            style={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 8, padding: '6px 12px',
              color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >Вийти</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: '#fff',
        borderBottom: `1px solid ${peach}`,
        flexShrink: 0,
      }}>
        <Tab active={tab === 'today'} onClick={() => setTab('today')}>Сьогодні</Tab>
        <Tab active={tab === 'week'}  onClick={() => setTab('week')}>Тиждень</Tab>
        <Tab active={tab === 'schedule'} onClick={() => setTab('schedule')}>Розклад</Tab>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'today'    && <TodayTab    salonId={salonId} />}
        {tab === 'week'     && <WeekTab     salonId={salonId} />}
        {tab === 'schedule' && <ScheduleTab salonId={salonId} />}
      </div>
    </div>
  );
}
