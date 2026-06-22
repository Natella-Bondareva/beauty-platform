import React, { useState, useEffect } from 'react';
import { inputStyle } from '../../../shared/ui/tokens';

const CARD = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #FFD1B3',
  padding: '20px 24px',
  boxShadow: '0 2px 8px rgba(213,122,102,0.07)',
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#64748b',
  marginBottom: 4,
};

const SLOT_OPTIONS = [15, 20, 30, 45, 60, 90, 120];

// "09:00:00" or "09:00" → "09:00"
function toTimeInput(val) {
  return val ? val.slice(0, 5) : '';
}

// "09:00" → "09:00:00"
function toApiTime(val) {
  return val ? `${val}:00` : '';
}

export default function WorkHoursSection({ settings, mutation }) {
  const [form, setForm] = useState({
    openingTime: '09:00',
    closingTime: '20:00',
    slotDurationMinutes: 60,
  });
  const [saved, setSaved] = useState(false);
  const [conflictMsg, setConflictMsg] = useState('');

  useEffect(() => {
    if (settings) {
      setForm({
        openingTime: toTimeInput(settings.openingTime),
        closingTime: toTimeInput(settings.closingTime),
        slotDurationMinutes: settings.defaultSlotDurationMinutes ?? 60,
      });
    }
  }, [settings]);

  const handleSave = () => {
    setConflictMsg('');
    mutation.mutate(
      {
        openingTime: toApiTime(form.openingTime),
        closingTime: toApiTime(form.closingTime),
        slotDurationMinutes: form.slotDurationMinutes,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        },
        onError: (err) => {
          const data = err.response?.data;
          const msg = data?.message ?? (typeof data === 'string' ? data : 'Помилка збереження');
          setConflictMsg(msg);
        },
      }
    );
  };

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div style={CARD}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>
        Робочі години
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Відкриття</label>
          <input
            type="time"
            value={form.openingTime}
            onChange={(e) => set('openingTime')(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Закриття</label>
          <input
            type="time"
            value={form.closingTime}
            onChange={(e) => set('closingTime')(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Крок слоту</label>
          <select
            value={form.slotDurationMinutes}
            onChange={(e) => set('slotDurationMinutes')(Number(e.target.value))}
            style={inputStyle}
          >
            {SLOT_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} хв
              </option>
            ))}
          </select>
        </div>
      </div>

      {conflictMsg && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 14,
            fontSize: 13,
            color: '#dc2626',
            lineHeight: 1.6,
          }}
        >
          {conflictMsg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
        {saved && <span style={{ fontSize: 13, color: '#22c55e' }}>Збережено ✓</span>}
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          style={{
            background: 'var(--gradient-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '9px 22px',
            fontSize: 13,
            fontWeight: 600,
            cursor: mutation.isPending ? 'not-allowed' : 'pointer',
            opacity: mutation.isPending ? 0.7 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {mutation.isPending ? 'Збереження…' : 'Зберегти'}
        </button>
      </div>
    </div>
  );
}
