import React, { useState, useEffect } from 'react';
import { ToggleSwitch } from '../../../../shared/ui/ToggleSwitch';
import { accent, peach, inputStyle } from '../../../../shared/ui/tokens';
import { useEmployeeSchedule } from '../../hooks/useEmployeeSchedule';

const DAY_SHORT = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DAY_FULL  = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

const toInput = (t) => (t ? t.slice(0, 5) : '');
const toTime  = (v) => (v ? `${v}:00` : '09:00:00');

function calcHours(start, end) {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} год` : `${h}г ${m}хв`;
}

const presetBtn = {
  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
  border: `1px solid ${peach}`, background: '#fff', color: '#64748b', cursor: 'pointer',
};

export default function ScheduleTab({ empId, enabled }) {
  const { constraintsQuery, saveMutation } = useEmployeeSchedule(empId, { enabled });
  const [schedule, setSchedule] = useState([]);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState('');

  const constraints = constraintsQuery.data;

  useEffect(() => {
    if (constraints?.currentSchedule) {
      setSchedule(constraints.currentSchedule);
    }
  }, [constraints]);

  if (constraintsQuery.isLoading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 28 }}>📅</span> Завантаження розкладу...
    </div>
  );

  if (!constraints) return null;

  const { salonOpeningTime, salonClosingTime, salonDaysOff } = constraints;
  const salonMin = toInput(salonOpeningTime);
  const salonMax = toInput(salonClosingTime);

  const setDay = (dow, patch) =>
    setSchedule((prev) => prev.map((d) => (d.dayOfWeek === dow ? { ...d, ...patch } : d)));

  const applyPreset = (workDays) =>
    setSchedule((prev) =>
      prev.map((d) => ({
        ...d,
        isWorking: workDays.includes(d.dayOfWeek) && !salonDaysOff.includes(d.dayOfWeek),
        startTime: salonOpeningTime,
        endTime: salonClosingTime,
      }))
    );

  const handleSave = async () => {
    setError('');
    try {
      await saveMutation.mutateAsync(schedule);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2500);
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Помилка збереження розкладу');
    }
  };

  const workingCount = schedule.filter(
    (d) => d.isWorking && !salonDaysOff.includes(d.dayOfWeek)
  ).length;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
      {/* Salon hours banner */}
      <div style={{ padding: '10px 16px', borderRadius: 12, background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)', border: '1px solid #bae6fd', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
        <span style={{ fontSize: 18 }}>🏢</span>
        <div>
          <span style={{ fontWeight: 600, color: '#0369a1' }}>Графік салону: </span>
          <span style={{ color: '#0284c7' }}>{salonMin} — {salonMax}</span>
          {salonDaysOff.length > 0 && (
            <span style={{ color: '#64748b', marginLeft: 8 }}>
              · Вихідні: <b>{salonDaysOff.map((d) => DAY_SHORT[d]).join(', ')}</b>
            </span>
          )}
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>Час майстра не може виходити за межі графіку салону</div>
        </div>
      </div>

      {/* Quick presets */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Шаблон:</span>
        {[['Пн–Пт', [1,2,3,4,5]], ['Пн–Сб', [1,2,3,4,5,6]], ['Щодня', [0,1,2,3,4,5,6]]].map(([label, days]) => (
          <button key={label} onClick={() => applyPreset(days)} style={presetBtn}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF5F0'; e.currentTarget.style.color = accent; e.currentTarget.style.borderColor = accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = peach; }}
          >{label}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b', fontWeight: 500 }}>
          {workingCount} {workingCount === 1 ? 'робочий день' : workingCount < 5 ? 'робочі дні' : 'робочих днів'}
        </span>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 14, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>{error}</p>}

      {/* Day rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {WEEK_ORDER.map((dow) => {
          const day = schedule.find((d) => d.dayOfWeek === dow);
          if (!day) return null;
          const isSalonOff = salonDaysOff.includes(dow);
          const isWorking  = day.isWorking && !isSalonOff;

          return (
            <div key={dow} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 14, border: `1px solid ${isSalonOff ? '#f1f5f9' : isWorking ? peach : '#e2e8f0'}`, background: isSalonOff ? '#fafafa' : isWorking ? '#FFF5F0' : '#fff', transition: 'all 0.15s' }}>
              <div style={{ width: 34, textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isSalonOff ? '#cbd5e1' : isWorking ? '#1E293B' : '#94a3b8' }}>{DAY_SHORT[dow]}</div>
                <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 1 }}>{DAY_FULL[dow].slice(0, 3)}</div>
              </div>

              <ToggleSwitch
                checked={isWorking}
                onChange={() => setDay(dow, { isWorking: !day.isWorking })}
                disabled={isSalonOff}
              />

              {isSalonOff ? (
                <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', flex: 1 }}>Вихідний день салону</span>
              ) : isWorking ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                  <input type="time" value={toInput(day.startTime)} min={salonMin} max={salonMax} onChange={(e) => setDay(dow, { startTime: toTime(e.target.value) })} style={{ ...inputStyle, width: 96, padding: '5px 8px', fontSize: 13, flex: 'none' }} />
                  <span style={{ color: '#cbd5e1', fontSize: 16 }}>—</span>
                  <input type="time" value={toInput(day.endTime)} min={salonMin} max={salonMax} onChange={(e) => setDay(dow, { endTime: toTime(e.target.value) })} style={{ ...inputStyle, width: 96, padding: '5px 8px', fontSize: 13, flex: 'none' }} />
                  <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{calcHours(day.startTime, day.endTime)}</span>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>Вихідний</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Save */}
      <div style={{ marginTop: 22 }}>
        {savedOk && (
          <div style={{ padding: '9px 14px', borderRadius: 10, marginBottom: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
            ✓ Розклад збережено
          </div>
        )}
        <button onClick={handleSave} disabled={saveMutation.isPending} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: 'var(--gradient-primary)', color: '#fff', cursor: saveMutation.isPending ? 'wait' : 'pointer', fontSize: 14, fontWeight: 600, opacity: saveMutation.isPending ? 0.7 : 1, boxShadow: '0 2px 12px rgba(213,122,102,0.28)' }}>
          {saveMutation.isPending ? 'Збереження...' : 'Зберегти розклад'}
        </button>
      </div>
    </div>
  );
}
