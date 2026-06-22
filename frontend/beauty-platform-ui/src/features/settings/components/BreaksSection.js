import React, { useState } from 'react';
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

// "13:00:00" → "13:00"
function toDisplay(val) {
  return val ? val.slice(0, 5) : '';
}

// "13:00" → "13:00:00"
function toApiTime(val) {
  return val ? `${val}:00` : '';
}

export default function BreaksSection({ settings, addMutation }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const breaks = settings?.breakTimes ?? [];

  const handleAdd = () => {
    if (!start || !end) return;
    addMutation.mutate(
      { start: toApiTime(start), end: toApiTime(end) },
      {
        onSuccess: () => {
          setStart('');
          setEnd('');
        },
      }
    );
  };

  const isValid = start && end && start < end;

  return (
    <div style={CARD}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
        Перерви салону
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
        Час, коли салон не приймає запити
      </div>

      {/* Add form */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          gap: 10,
          alignItems: 'flex-end',
          marginBottom: 16,
        }}
      >
        <div>
          <label style={labelStyle}>Початок</label>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Кінець</label>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            style={inputStyle}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!isValid || addMutation.isPending}
          title={!isValid ? 'Вкажіть коректний інтервал' : ''}
          style={{
            height: 36,
            padding: '0 16px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--gradient-primary)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: !isValid || addMutation.isPending ? 'not-allowed' : 'pointer',
            opacity: !isValid || addMutation.isPending ? 0.7 : 1,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
          }}
        >
          + Додати
        </button>
      </div>

      {/* List */}
      {breaks.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '20px 0',
            color: '#94a3b8',
            fontSize: 13,
            background: '#f8fafc',
            borderRadius: 10,
          }}
        >
          Перерв не додано
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {breaks.map((b, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#FFF5F0',
                border: '1px solid #FFD1B3',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>☕</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#475569',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {toDisplay(b.start)} – {toDisplay(b.end)}
              </span>
            </div>
          ))}
        </div>
      )}

      {addMutation.isError && (
        <div style={{ marginTop: 10, fontSize: 13, color: '#ef4444' }}>
          {addMutation.error?.response?.data?.message ?? 'Помилка додавання перерви'}
        </div>
      )}
    </div>
  );
}
