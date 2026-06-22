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

// "2026-05-01T00:00:00Z" or "2026-05-01" → "01.05.2026"
function formatDate(val) {
  const dateStr = val ? val.split('T')[0] : '';
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

export default function SpecialDaysOffSection({ settings, addMutation, removeMutation }) {
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  const specialDays = settings?.specialDaysOff ?? [];

  const handleAdd = () => {
    if (!date) return;
    addMutation.mutate(
      { date: `${date}T00:00:00Z`, reason: reason.trim() },
      {
        onSuccess: () => {
          setDate('');
          setReason('');
        },
      }
    );
  };

  return (
    <div style={CARD}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
        Особливі вихідні
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
        Конкретні дати, коли салон не працює
      </div>

      {/* Add form */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 10, alignItems: 'flex-end', marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Дата</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Причина (необов'язково)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="День праці"
            style={inputStyle}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!date || addMutation.isPending}
          style={{
            height: 36,
            padding: '0 16px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--gradient-primary)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: !date || addMutation.isPending ? 'not-allowed' : 'pointer',
            opacity: !date || addMutation.isPending ? 0.7 : 1,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
          }}
        >
          + Додати
        </button>
      </div>

      {/* List */}
      {specialDays.length === 0 ? (
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
          Особливих вихідних не додано
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {specialDays.map((day) => (
            <div
              key={day.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                background: '#FFF5F0',
                border: '1px solid #FFD1B3',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#D57A66',
                  minWidth: 80,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatDate(day.date)}
              </span>
              <span style={{ flex: 1, fontSize: 13, color: '#475569' }}>
                {day.reason || <span style={{ color: '#94a3b8' }}>—</span>}
              </span>
              <button
                onClick={() => removeMutation.mutate(day.id)}
                disabled={removeMutation.isPending}
                title="Видалити"
                style={{
                  width: 28,
                  height: 28,
                  border: 'none',
                  borderRadius: 8,
                  background: 'transparent',
                  cursor: removeMutation.isPending ? 'not-allowed' : 'pointer',
                  color: '#94a3b8',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fee2e2';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {(addMutation.isError || removeMutation.isError) && (
        <div style={{ marginTop: 10, fontSize: 13, color: '#ef4444' }}>
          {addMutation.error?.response?.data?.message ??
            removeMutation.error?.response?.data?.message ??
            'Помилка операції'}
        </div>
      )}
    </div>
  );
}
