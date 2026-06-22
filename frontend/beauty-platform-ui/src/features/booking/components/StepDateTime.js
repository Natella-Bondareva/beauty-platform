import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../api/booking.api';
import { Avatar } from '../../../shared/ui/Avatar';

const accent = '#D57A66';
const peach = '#FFD1B3';
const bg = '#FFF5F0';

const DAY_NAMES = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTH_NAMES = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
];
const MONTH_SHORT = [
  'січ', 'лют', 'бер', 'кві', 'тра', 'чер',
  'лип', 'сер', 'вер', 'жов', 'лис', 'гру',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildDays(count = 21) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function toIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Форматує дату найближчого слоту: "Сьогодні · 10:30" / "Завтра · 10:30" / "Чт, 22 тра · 10:30"
function formatNearestDate(dateStr, timeLocal) {
  // dateStr = "2026-05-19" (DateOnly від .NET)
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  if (date.getTime() === today.getTime())    return `Сьогодні · ${timeLocal}`;
  if (date.getTime() === tomorrow.getTime()) return `Завтра · ${timeLocal}`;

  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_SHORT[date.getMonth()]} · ${timeLocal}`;
}

// ── DateStrip (ручний вибір) ──────────────────────────────────────────────────

function DateStrip({ selected, onSelect }) {
  const days = buildDays(21);
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
      {days.map((d) => {
        const iso = toIso(d);
        const isActive = selected === iso;
        return (
          <button
            key={iso}
            onClick={() => onSelect(iso)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              minWidth: 52, padding: '10px 6px', borderRadius: 12, flexShrink: 0,
              border: `1.5px solid ${isActive ? accent : peach}`,
              background: isActive ? accent : '#fff',
              color: isActive ? '#fff' : '#475569',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>{DAY_NAMES[d.getDay()]}</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{d.getDate()}</span>
            <span style={{ fontSize: 10, opacity: 0.7 }}>{MONTH_NAMES[d.getMonth()]}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Сценарій А: будь-який майстер — групуємо слоти по часу ───────────────────

function AnyEmployeeSlots({ slots, onSelect }) {
  const grouped = {};
  slots.forEach((slot) => {
    const key = slot.startTimeLocal;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(slot);
  });
  const times = Object.keys(grouped).sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {times.map((time) => (
        <div key={time} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#64748b', minWidth: 48, fontWeight: 500 }}>{time}</span>
          {grouped[time].map((slot, i) => (
            <button
              key={i}
              onClick={() => onSelect(slot)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 20,
                border: `1.5px solid ${peach}`, background: '#fff',
                cursor: 'pointer', fontSize: 13, color: '#1E293B', transition: 'all 0.15s', fontWeight: 500,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = bg; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = peach; e.currentTarget.style.background = '#fff'; }}
            >
              <Avatar name={slot.employeeName} avatarUrl={slot.employeeAvatarUrl} size={22} />
              <span>{slot.employeeName}</span>
              {slot.price && <span style={{ color: accent, fontWeight: 600 }}>{slot.price} ₴</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Сценарій Б: конкретний майстер — простий список ───────────────────────────

function SingleEmployeeSlots({ slots, onSelect, employee }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {slots.map((slot, i) => (
        <button
          key={i}
          onClick={() => onSelect({ ...slot, employeeId: employee.id, employeeName: employee.fullName, employeeAvatarUrl: employee.avatarUrl })}
          style={{
            padding: '10px 18px', borderRadius: 10,
            border: `1.5px solid ${peach}`, background: '#fff',
            cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#1E293B', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = bg; e.currentTarget.style.color = accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = peach; e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1E293B'; }}
        >
          {slot.startTimeLocal}
        </button>
      ))}
    </div>
  );
}

// ── Найближчий режим ──────────────────────────────────────────────────────────

function NearestSlotsView({ slots, isLoading, onAccept, onChooseTime }) {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
        <div style={{ fontSize: 14 }}>Шукаємо найближчі слоти…</div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>Немає вільних записів</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>У найближчі 14 днів немає доступних слотів</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {slots.map((slot) => (
        <div
          key={slot.employeeId}
          style={{
            background: '#fff', borderRadius: 14,
            border: `1.5px solid ${peach}`,
            padding: '14px 16px',
            boxShadow: '0 1px 6px rgba(213,122,102,0.07)',
          }}
        >
          {/* Майстер + час */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={slot.employeeName} avatarUrl={slot.employeeAvatarUrl} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{slot.employeeName}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: accent, marginTop: 2 }}>
                {formatNearestDate(slot.date, slot.startTimeLocal)}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {slot.clientDurationMinutes} хв · {slot.price} ₴
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => onChooseTime(slot)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 10,
                border: `1.5px solid ${peach}`, background: 'transparent',
                fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = bg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Обрати час
            </button>
            <button
              onClick={() => onAccept(slot)}
              style={{
                flex: 2, padding: '9px 0', borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${peach}, ${accent})`,
                fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(213,122,102,0.3)',
              }}
            >
              ⚡ Записатись
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Перемикач режимів ─────────────────────────────────────────────────────────

function ModeToggle({ mode, onChange }) {
  const tabs = [
    { key: 'nearest', label: '⚡ Найближчий' },
    { key: 'manual',  label: '📅 Обрати дату' },
  ];
  return (
    <div style={{
      display: 'flex', borderRadius: 12, overflow: 'hidden',
      border: `1.5px solid ${peach}`, background: bg, marginBottom: 20,
    }}>
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: mode === key ? 700 : 500,
            background: mode === key ? `linear-gradient(135deg, ${peach}, ${accent})` : 'transparent',
            color: mode === key ? '#fff' : '#64748b',
            transition: 'all 0.18s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function StepDateTime({ salonId, selectedService, selectedEmployee, onSelect }) {
  const [mode, setMode] = useState('nearest');

  // Перевизначений майстер при кліку "Обрати час" з режиму найближчого
  const [overrideEmployee, setOverrideEmployee] = useState(null);

  const [selectedDate, setSelectedDate] = useState(() => toIso(new Date()));
  const debounceRef = useRef(null);
  const [debouncedDate, setDebouncedDate] = useState(selectedDate);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedDate(selectedDate), 300);
    return () => clearTimeout(debounceRef.current);
  }, [selectedDate]);

  // Ефективний майстер: може бути переданий ззовні або встановлений через "Обрати час"
  const effectiveEmployee = overrideEmployee ?? selectedEmployee;
  const isAnyEmployee = effectiveEmployee === null;

  // ── Запити ─────────────────────────────────────────────────────────────────

  // Найближчий режим
  const nearestQuery = useQuery({
    queryKey: ['booking', salonId, 'nearest', selectedService?.id],
    queryFn: () => bookingApi.getNearestSlots(salonId, selectedService.id).then(r => r.data),
    enabled: !!salonId && !!selectedService && mode === 'nearest',
    staleTime: 60_000,
  });

  // Ручний режим — Сценарій А (будь-який майстер)
  const allSlotsQuery = useQuery({
    queryKey: ['booking', salonId, 'slots', selectedService?.id, debouncedDate],
    queryFn: () => bookingApi.getSlots(salonId, selectedService.id, debouncedDate).then(r => r.data),
    enabled: !!salonId && !!selectedService && isAnyEmployee && !!debouncedDate && mode === 'manual',
  });

  // Ручний режим — Сценарій Б (конкретний майстер)
  const empSlotsQuery = useQuery({
    queryKey: ['booking', salonId, 'empSlots', effectiveEmployee?.id, selectedService?.id, debouncedDate],
    queryFn: () =>
      bookingApi.getEmployeeSlots(salonId, effectiveEmployee.id, selectedService.id, debouncedDate).then(r => r.data),
    enabled: !!salonId && !!selectedService && !isAnyEmployee && !!effectiveEmployee && !!debouncedDate && mode === 'manual',
  });

  // ── Обробники ──────────────────────────────────────────────────────────────

  const handleModeChange = (newMode) => {
    if (newMode === 'nearest') setOverrideEmployee(null);
    setMode(newMode);
  };

  // "Записатись" з картки найближчого слоту
  const handleAcceptNearest = (slot) => {
    onSelect({
      startTimeUtc:      slot.startTimeUtc,
      endTimeUtc:        slot.endTimeUtc,
      startTimeLocal:    slot.startTimeLocal,
      endTimeLocal:      slot.endTimeLocal,
      employeeId:        slot.employeeId,
      employeeName:      slot.employeeName,
      employeeAvatarUrl: slot.employeeAvatarUrl,
      price:             slot.price,
      clientDurationMinutes: slot.clientDurationMinutes,
    });
  };

  // "Обрати час" — переходить до ручного режиму для конкретного майстра
  const handleChooseTime = (slot) => {
    setOverrideEmployee({
      id:        slot.employeeId,
      fullName:  slot.employeeName,
      avatarUrl: slot.employeeAvatarUrl,
    });
    setSelectedDate(slot.date); // pre-select найближчий доступний день
    setMode('manual');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const isManualLoading = isAnyEmployee ? allSlotsQuery.isLoading : empSlotsQuery.isLoading;
  const slotsA = allSlotsQuery.data ?? [];
  const slotsB = empSlotsQuery.data?.slots ?? [];

  const employeeHint = overrideEmployee?.fullName
    ?? effectiveEmployee?.fullName;

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
        Оберіть дату та час
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
        Крок 3 з 6 · {selectedService?.name}
        {employeeHint && (
          <> · <strong style={{ color: '#64748b' }}>{employeeHint}</strong></>
        )}
      </div>

      <ModeToggle mode={mode} onChange={handleModeChange} />

      {/* ── Найближчий режим ── */}
      {mode === 'nearest' && (
        <NearestSlotsView
          slots={nearestQuery.data ?? []}
          isLoading={nearestQuery.isLoading}
          onAccept={handleAcceptNearest}
          onChooseTime={handleChooseTime}
        />
      )}

      {/* ── Ручний режим ── */}
      {mode === 'manual' && (
        <>
          {/* Підказка якщо обрано конкретного майстра через "Обрати час" */}
          {overrideEmployee && (
            <div style={{
              marginBottom: 14, padding: '8px 12px',
              background: bg, border: `1px solid ${peach}`, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                Розклад майстра: <strong style={{ color: '#1E293B' }}>{overrideEmployee.fullName}</strong>
              </span>
              <button
                onClick={() => setOverrideEmployee(null)}
                style={{ fontSize: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
              >
                Усі майстри
              </button>
            </div>
          )}

          <DateStrip selected={selectedDate} onSelect={setSelectedDate} />

          <div style={{ marginTop: 20 }}>
            {isManualLoading ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 14 }}>
                Завантаження вільних слотів…
              </div>
            ) : isAnyEmployee ? (
              slotsA.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 14 }}>
                  На цю дату немає вільного часу
                </div>
              ) : (
                <AnyEmployeeSlots slots={slotsA} onSelect={onSelect} />
              )
            ) : slotsB.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 14 }}>
                На цю дату у майстра немає вільного часу
              </div>
            ) : (
              <SingleEmployeeSlots slots={slotsB} onSelect={onSelect} employee={effectiveEmployee} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
