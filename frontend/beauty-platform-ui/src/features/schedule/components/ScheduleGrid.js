import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/dashboard/Icon';

const SLOT_H   = 44;       // px per 30-min slot
const TIME_W   = 64;       // px for time column
const MIN_COL_W = 140;     // px minimum column width
const START_HOUR = 9;
const END_HOUR   = 21;

const UA_DAYS        = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
const UA_MONTH       = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];
const UA_MONTH_SHORT = ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жов','Лис','Гру'];

// ── Booking status colors ─────────────────────────────────────────────────────
// status: 0=Pending, 1=Confirmed, 2=Completed, 3=Expired, 4=Cancelled, 5=NoShow
const STATUS_STYLE = {
  0: { bg: '#fef9c3', border: '#fbbf24', text: '#92400e' },  // Pending   — жовтий
  1: { bg: '#dbeafe', border: '#60a5fa', text: '#1e40af' },  // Confirmed — синій
  2: { bg: '#dcfce7', border: '#4ade80', text: '#166534' },  // Completed — зелений
  3: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },  // Expired   — сірий
  4: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },  // Cancelled — сірий
  5: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' },  // NoShow    — червоний
};

const STATUS_LABEL = {
  0: 'Очікує',
  1: 'Підтверджено',
  2: 'Завершено',
  3: 'Протерміновано',
  4: 'Скасовано',
  5: 'Не з\'явився',
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function generateSlots() {
  const slots = [];
  for (let m = START_HOUR * 60; m < END_HOUR * 60; m += 30) {
    const h   = Math.floor(m / 60);
    const min = m % 60;
    slots.push({ h, min, totalMins: m, label: `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}` });
  }
  return slots;
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
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

// "09:00:00" → хвилини від початку доби
function timeSpanToMins(ts) {
  if (!ts) return 0;
  const parts = ts.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// UTC datetime → локальний "HH:MM"
function utcToLocalLabel(utcStr) {
  const d = new Date(utcStr);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function durationMins(startUtc, endUtc) {
  return Math.round((new Date(endUtc) - new Date(startUtc)) / 60_000);
}

// ── Lookup builders ───────────────────────────────────────────────────────────

/**
 * Будує Map: employeeId → Map<DayOfWeek(0-6 JS), { isWorking, startMins, endMins }>
 * DayOfWeek у C#/.NET: Sunday=0, Monday=1 …  (те саме що JS getDay())
 */
function buildScheduleMap(schedules) {
  const map = new Map();
  for (const emp of schedules) {
    const dayMap = new Map();
    for (const s of emp.schedule ?? []) {
      dayMap.set(s.dayOfWeek, {
        isWorking: s.isWorking,
        startMins: timeSpanToMins(s.startTime),
        endMins:   timeSpanToMins(s.endTime),
      });
    }
    map.set(emp.employeeId, dayMap);
  }
  return map;
}

/**
 * Повертає стан клітинки для конкретного (employeeId, date, slotMins):
 * 'nonWorking' | 'offHours' | 'break' | null (вільно/бронювання окремо)
 */
function getCellState(employeeId, date, slotMins, scheduleMap, breaks) {
  const dayMap = scheduleMap.get(employeeId);
  const dayOfWeek = date.getDay(); // 0=Sun … 6=Sat — збігається з C# DayOfWeek
  const day = dayMap?.get(dayOfWeek);

  if (!day || !day.isWorking) return 'nonWorking';
  if (slotMins < day.startMins || slotMins >= day.endMins) return 'offHours';

  const isoDate = toIsoDate(date);
  const hasBreak = breaks.some(
    (b) =>
      b.employeeId === employeeId &&
      b.date === isoDate &&
      timeSpanToMins(b.startTime) <= slotMins &&
      timeSpanToMins(b.endTime)   >  slotMins
  );
  if (hasBreak) return 'break';

  return null; // вільний або бронювання — рендеримо далі
}

function getBreakReason(employeeId, date, slotMins, breaks) {
  const isoDate = toIsoDate(date);
  const b = breaks.find(
    (b) =>
      b.employeeId === employeeId &&
      b.date === isoDate &&
      timeSpanToMins(b.startTime) <= slotMins &&
      timeSpanToMins(b.endTime)   >  slotMins
  );
  return b?.reason ?? 'Перерва';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ name, size = 32 }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  const hue = [...(name || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue},50%,60%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.4, userSelect: 'none'
    }}>{initial}</div>
  );
}

function NavBtn({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32, height: 32, border: '1px solid #FFD1B3', borderRadius: 8,
        background: '#fff', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#64748b', transition: 'all 0.15s', fontSize: 16
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#FFF5F0'; e.currentTarget.style.borderColor = '#D57A66'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff';    e.currentTarget.style.borderColor = '#FFD1B3'; }}
    >{children}</button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ScheduleGrid({
  viewMode, setViewMode,
  selectedDate, setSelectedDate,
  selectedMasterId, setSelectedMasterId,
  employees,
  bookings  = [],
  schedules = [],   // [{ employeeId, schedule: [{ dayOfWeek, isWorking, startTime, endTime }] }]
  breaks    = [],   // [{ id, employeeId, date, startTime, endTime, reason }]
  loading,
  onNewBooking,
  onBookingClick,
}) {
  const routerNavigate = useNavigate();
  const today     = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const timeSlots = useMemo(generateSlots, []);
  const weekDays  = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  // Карта розкладів для швидкого пошуку
  const scheduleMap = useMemo(() => buildScheduleMap(schedules), [schedules]);

  // Live current-time indicator
  const [nowPos, setNowPos] = useState(null);
  useEffect(() => {
    const calc = () => {
      const now  = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const start = START_HOUR * 60;
      const end   = END_HOUR   * 60;
      setNowPos(mins >= start && mins < end ? ((mins - start) / 30) * SLOT_H : null);
    };
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, []);

  const navigate = (dir) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * (viewMode === 'week' ? 7 : 1));
    setSelectedDate(d);
  };

  const goToday = () => setSelectedDate(new Date());
  const isCurrentWeek = isSameDay(getMondayOfWeek(selectedDate), getMondayOfWeek(today));

  const formatRange = () => {
    const [first, last] = [weekDays[0], weekDays[6]];
    const sameMonth = first.getMonth() === last.getMonth();
    return sameMonth
      ? `${first.getDate()}–${last.getDate()} ${UA_MONTH[first.getMonth()]} ${first.getFullYear()}`
      : `${first.getDate()} ${UA_MONTH_SHORT[first.getMonth()]} – ${last.getDate()} ${UA_MONTH_SHORT[last.getMonth()]} ${last.getFullYear()}`;
  };

  const formatDay = () => {
    const d = selectedDate;
    return `${UA_DAYS[(d.getDay() + 6) % 7]}, ${d.getDate()} ${UA_MONTH[d.getMonth()]} ${d.getFullYear()}`;
  };

  const columns   = viewMode === 'week' ? weekDays : employees;
  const colCount  = columns.length || 1;
  const gridCols  = `${TIME_W}px repeat(${colCount}, minmax(${MIN_COL_W}px, 1fr))`;

  // Повертає бронювання що ПОЧИНАЮТЬСЯ у цьому слоті для колонки
  const getBookingsAt = (colIdx, slot) =>
    bookings.filter((b) => {
      const startLocal = utcToLocalLabel(b.startTimeUtc);
      if (viewMode === 'week') {
        return (
          isSameDay(new Date(b.startTimeUtc), columns[colIdx]) &&
          b.employeeId === selectedMasterId &&
          startLocal === slot.label
        );
      }
      return b.employeeId === columns[colIdx]?.id && startLocal === slot.label;
    });

  // ── Toolbar ─────────────────────────────────────────────────────────────────

  const Toolbar = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      padding: '14px 24px', background: '#fff',
      borderBottom: '1px solid #FFD1B3', flexShrink: 0,
      boxShadow: '0 2px 8px rgba(213,122,102,0.06)'
    }}>
      {/* View toggle */}
      <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1.5px solid #FFD1B3', background: '#FFF5F0' }}>
        {[['week','Тиждень'],['day','День']].map(([m, label]) => (
          <button key={m} onClick={() => setViewMode(m)} style={{
            padding: '7px 20px', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500,
            background: viewMode === m ? 'var(--gradient-primary)' : 'transparent',
            color: viewMode === m ? '#fff' : '#64748b',
            transition: 'all 0.18s'
          }}>{label}</button>
        ))}
      </div>

      {/* Date navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <NavBtn onClick={() => navigate(-1)} title="Попередній">‹</NavBtn>
        <button
          onClick={goToday}
          style={{
            padding: '6px 16px', border: '1.5px solid', borderRadius: 8,
            borderColor: isCurrentWeek ? '#D57A66' : '#FFD1B3',
            background: isCurrentWeek ? 'rgba(213,122,102,0.08)' : '#fff',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: isCurrentWeek ? '#D57A66' : '#64748b', transition: 'all 0.15s'
          }}
        >Сьогодні</button>
        <NavBtn onClick={() => navigate(1)} title="Наступний">›</NavBtn>
      </div>

      <span style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', letterSpacing: '-0.2px' }}>
        {viewMode === 'week' ? formatRange() : formatDay()}
      </span>

      {/* Master filter — week view */}
      {viewMode === 'week' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
            Майстер:
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {employees.length === 0 ? (
              <span style={{ fontSize: 13, color: '#cbd5e1' }}>Немає майстрів</span>
            ) : (
              employees.map(emp => {
                const active = selectedMasterId === emp.id;
                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedMasterId(emp.id)}
                    title={emp.fullName}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 12px 4px 6px', borderRadius: 20,
                      border: `1.5px solid ${active ? '#D57A66' : '#FFD1B3'}`,
                      background: active ? 'var(--gradient-primary)' : '#fff',
                      cursor: 'pointer', fontSize: 12, fontWeight: 500,
                      color: active ? '#fff' : '#475569',
                      transition: 'all 0.15s', whiteSpace: 'nowrap'
                    }}
                  >
                    <Avatar name={emp.fullName} size={22} />
                    {emp.fullName.split(' ')[0]}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ── Header row ───────────────────────────────────────────────────────────────

  const HeaderRow = (
    <div style={{
      display: 'grid', gridTemplateColumns: gridCols,
      position: 'sticky', top: 0, zIndex: 20,
      background: '#fff', borderBottom: '2px solid #FFD1B3',
      boxShadow: '0 2px 6px rgba(213,122,102,0.08)'
    }}>
      <div style={{ background: '#FFF5F0', borderRight: '1px solid #FFD1B3' }} />

      {viewMode === 'week'
        ? weekDays.map((date, i) => {
            const isToday = isSameDay(date, today);
            return (
              <div key={i} style={{
                padding: '10px 8px', textAlign: 'center',
                borderLeft: '1px solid #FFD1B3',
                background: isToday ? 'linear-gradient(135deg,#FFD1B3,#D57A66)' : '#FFF5F0',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: isToday ? 'rgba(255,255,255,0.85)' : '#94a3b8' }}>
                  {UA_DAYS[i]}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: isToday ? '#fff' : '#1E293B', lineHeight: 1.1, marginTop: 2 }}>
                  {date.getDate()}
                </div>
                <div style={{ fontSize: 10, color: isToday ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginTop: 1 }}>
                  {UA_MONTH_SHORT[date.getMonth()]}
                </div>
              </div>
            );
          })
        : employees.map((emp) => (
            <div key={emp.id} style={{
              padding: '10px 8px', textAlign: 'center',
              borderLeft: '1px solid #FFD1B3', background: '#FFF5F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar name={emp.fullName} size={36} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B', marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {emp.fullName.split(' ')[0]}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {emp.categories?.[0]?.name ?? ''}
              </div>
            </div>
          ))
      }
    </div>
  );

  // ── Grid body ─────────────────────────────────────────────────────────────────

  const GridBody = (
    <div style={{ position: 'relative' }}>
      {/* Current time line */}
      {nowPos !== null && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: nowPos, zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: TIME_W - 6, top: -5, width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ marginLeft: TIME_W, height: 2, background: '#ef4444', opacity: 0.9 }} />
        </div>
      )}

      {timeSlots.map((slot) => {
        const isHour  = slot.min === 0;
        const isEvenH = slot.h % 2 === 0;

        return (
          <div key={slot.label} style={{
            display: 'grid', gridTemplateColumns: gridCols,
            minHeight: SLOT_H,
            borderBottom: `1px solid ${isHour ? '#FFD1B3' : 'rgba(255,209,179,0.35)'}`,
          }}>
            {/* Time label */}
            <div style={{
              padding: '0 10px', display: 'flex', alignItems: 'flex-start', paddingTop: isHour ? 4 : 0,
              borderRight: '1px solid #FFD1B3',
              background: isEvenH && isHour ? '#FFF5F0' : '#FAFAFA',
              position: 'sticky', left: 0, zIndex: 5
            }}>
              {isHour && (
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap', lineHeight: 1 }}>
                  {slot.label}
                </span>
              )}
            </div>

            {/* Cells */}
            {columns.map((col, ci) => {
              // Визначаємо ідентифікатор майстра і дату для цієї клітинки
              const employeeId = viewMode === 'week' ? selectedMasterId : col?.id;
              const cellDate   = viewMode === 'week' ? col : selectedDate;

              const state = employeeId
                ? getCellState(employeeId, cellDate, slot.totalMins, scheduleMap, breaks)
                : null;

              const isNonWorking = state === 'nonWorking';
              const isOffHours   = state === 'offHours';
              const isBreak      = state === 'break';
              const isFirstSlot  = slot.h === START_HOUR && slot.min === 0;

              // Колір фону клітинки
              let cellBg;
              if (isNonWorking)     cellBg = '#f1f5f9';
              else if (isOffHours)  cellBg = '#f8fafc';
              else if (isBreak)     cellBg = 'rgba(251,191,36,0.12)';
              else {
                const isColToday = viewMode === 'week'
                  ? isSameDay(col, today)
                  : isSameDay(selectedDate, today);
                cellBg = isColToday
                  ? (isHour ? 'rgba(213,122,102,0.04)' : 'rgba(213,122,102,0.02)')
                  : (isEvenH && isHour ? 'rgba(0,0,0,0.008)' : 'transparent');
              }

              const cellBookings = (!isNonWorking && !isOffHours && !isBreak)
                ? getBookingsAt(ci, slot)
                : [];

              return (
                <div
                  key={ci}
                  onClick={() => {
                    if (!isNonWorking && !isOffHours && !isBreak && cellBookings.length === 0) {
                      onNewBooking?.({ employeeId, date: cellDate, time: slot.label });
                    }
                  }}
                  style={{
                    borderLeft: `1px solid ${isHour ? '#FFD1B3' : 'rgba(255,209,179,0.35)'}`,
                    minHeight: SLOT_H,
                    position: 'relative',
                    background: cellBg,
                    cursor: (!isNonWorking && !isOffHours && !isBreak && cellBookings.length === 0)
                      ? 'pointer' : 'default',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => {
                    if (!isNonWorking && !isOffHours && !isBreak && cellBookings.length === 0)
                      e.currentTarget.style.background = 'rgba(213,122,102,0.07)';
                  }}
                  onMouseLeave={e => { e.currentTarget.style.background = cellBg; }}
                >
                  {/* Вихідний label — показуємо один раз у першому слоті */}
                  {isNonWorking && isFirstSlot && (
                    <div style={{
                      position: 'absolute', top: 6, left: 0, right: 0,
                      textAlign: 'center', fontSize: 10, fontWeight: 600,
                      color: '#94a3b8', letterSpacing: '0.5px', pointerEvents: 'none',
                      zIndex: 2,
                    }}>
                      ВИХІДНИЙ
                    </div>
                  )}

                  {/* Перерва label */}
                  {isBreak && (
                    <div style={{
                      position: 'absolute', top: 2, left: 2, right: 2, bottom: 2,
                      borderRadius: 6,
                      background: 'rgba(251,191,36,0.25)',
                      border: '1px solid rgba(251,191,36,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 600, color: '#92400e',
                      pointerEvents: 'none', zIndex: 2,
                    }}>
                      {getBreakReason(employeeId, cellDate, slot.totalMins, breaks)}
                    </div>
                  )}

                  {/* Бронювання */}
                  {cellBookings.map((b) => {
                    const dur     = durationMins(b.startTimeUtc, b.endTimeUtc);
                    const heightPx = Math.max((dur / 30) * SLOT_H - 4, SLOT_H - 4);
                    const style   = STATUS_STYLE[b.status] ?? STATUS_STYLE[1];
                    return (
                      <div
                        key={b.id}
                        title={`${b.clientName} — ${b.serviceName}\n${STATUS_LABEL[b.status]}`}
                        onClick={(e) => { e.stopPropagation(); onBookingClick?.(b.id); }}
                        style={{
                          position: 'absolute', top: 2, left: 2, right: 2,
                          height: heightPx,
                          zIndex: 3,
                          borderRadius: 7,
                          background: style.bg,
                          border: `1.5px solid ${style.border}`,
                          padding: '3px 7px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                          transition: 'filter 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.96)')}
                        onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: style.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.clientName || b.clientPhone}
                        </div>
                        <div style={{ fontSize: 10, color: style.text, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.serviceName}
                        </div>
                        {dur > 30 && (
                          <div style={{ fontSize: 10, color: style.text, opacity: 0.65, marginTop: 1 }}>
                            {utcToLocalLabel(b.startTimeUtc)}–{utcToLocalLabel(b.endTimeUtc)} · {b.price} ₴
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  // ── Empty / loading states ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {Toolbar}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p style={{ fontSize: 14 }}>Завантаження...</p>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'day' && employees.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {Toolbar}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#94a3b8', maxWidth: 300 }}>
            <Icon name="users" size={48} color="#FFD1B3" />
            <p style={{ fontSize: 15, fontWeight: 600, marginTop: 16, color: '#64748b' }}>Майстрів ще немає</p>
            <p style={{ fontSize: 13, marginTop: 6, marginBottom: 20 }}>Додайте першого майстра, щоб побачити розклад</p>
            <button
              onClick={() => routerNavigate('/employees')}
              style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: 'var(--gradient-primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, boxShadow: '0 2px 10px rgba(213,122,102,0.3)' }}
            >Додати першого майстра</button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'week' && !selectedMasterId && employees.length > 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {Toolbar}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#94a3b8', maxWidth: 300 }}>
            <Icon name="person" size={48} color="#FFD1B3" />
            <p style={{ fontSize: 15, fontWeight: 600, marginTop: 16, color: '#64748b' }}>Оберіть майстра</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Натисніть на ім'я майстра у фільтрі вище</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {Toolbar}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <div style={{ minWidth: viewMode === 'week' ? TIME_W + 7 * MIN_COL_W : TIME_W + Math.max(1, employees.length) * MIN_COL_W }}>
          {HeaderRow}
          {GridBody}
        </div>

        {/* Порожній стан — тільки якщо немає бронювань на цей тиждень */}
        {bookings.length === 0 && !loading && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', zIndex: 6,
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)',
              borderRadius: 18, padding: '28px 36px',
              boxShadow: '0 4px 24px rgba(213,122,102,0.14)',
              border: '1px solid #FFD1B3',
            }}>
              <Icon name="calendar" size={40} color="#FFD1B3" />
              <p style={{ margin: '12px 0 4px', fontSize: 15, fontWeight: 600, color: '#64748b' }}>Записів ще немає</p>
              <p style={{ margin: '0 0 18px', fontSize: 13, color: '#94a3b8' }}>Натисніть на вільний слот або створіть запис вручну</p>
              <button
                onClick={() => onNewBooking?.()}
                style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: 'var(--gradient-primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, boxShadow: '0 2px 10px rgba(213,122,102,0.3)' }}
              >Зробити перший запис</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
