import React, { useState } from 'react';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  format,
} from 'date-fns';

const accent = '#D57A66';
const peach = '#FFD1B3';

function toDateInput(isoStr) {
  if (!isoStr) return '';
  return format(new Date(isoStr), 'yyyy-MM-dd');
}

function fromDateInput(str) {
  if (!str) return '';
  return new Date(str).toISOString();
}

export default function DateRangePicker({ value, onApply }) {
  const [preset, setPreset] = useState('month');
  const [customFrom, setCustomFrom] = useState(toDateInput(value?.from));
  const [customTo, setCustomTo] = useState(toDateInput(value?.to));

  const presets = [
    { key: 'week', label: 'Цей тиждень' },
    { key: 'month', label: 'Цей місяць' },
    { key: '30days', label: '30 днів' },
    { key: 'custom', label: 'Власний' },
  ];

  const calcRange = (key) => {
    const now = new Date();
    switch (key) {
      case 'week':
        return {
          from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
          to: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        };
      case 'month':
        return {
          from: startOfMonth(now).toISOString(),
          to: endOfMonth(now).toISOString(),
        };
      case '30days':
        return {
          from: subDays(now, 30).toISOString(),
          to: now.toISOString(),
        };
      default:
        return null;
    }
  };

  const handlePreset = (key) => {
    setPreset(key);
    if (key !== 'custom') {
      const range = calcRange(key);
      setCustomFrom(toDateInput(range.from));
      setCustomTo(toDateInput(range.to));
    }
  };

  const handleApply = () => {
    let range;
    if (preset === 'custom') {
      range = {
        from: fromDateInput(customFrom),
        to: fromDateInput(customTo),
      };
    } else {
      range = calcRange(preset);
    }
    if (range) onApply(range);
  };

  const displayFrom = customFrom ? format(new Date(customFrom), 'dd.MM.yyyy') : '—';
  const displayTo = customTo ? format(new Date(customTo), 'dd.MM.yyyy') : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
      {/* Date display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#475569' }}>
        <span style={{ fontWeight: 600 }}>{displayFrom}</span>
        <span style={{ color: '#cbd5e1' }}>→</span>
        <span style={{ fontWeight: 600 }}>{displayTo}</span>
        <button
          onClick={handleApply}
          style={{
            padding: '6px 16px',
            borderRadius: 8,
            border: 'none',
            background: accent,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Застосувати
        </button>
      </div>

      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: 6 }}>
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePreset(p.key)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: `1px solid ${preset === p.key ? accent : peach}`,
              background: preset === p.key ? '#FFF0EB' : '#fff',
              color: preset === p.key ? accent : '#64748b',
              fontSize: 12,
              fontWeight: preset === p.key ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      {preset === 'custom' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: `1px solid ${peach}`,
              fontSize: 13,
              color: '#1e293b',
              outline: 'none',
            }}
          />
          <span style={{ color: '#cbd5e1' }}>—</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: `1px solid ${peach}`,
              fontSize: 13,
              color: '#1e293b',
              outline: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}
