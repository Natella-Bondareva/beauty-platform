import React from 'react';

const CARD = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #FFD1B3',
  padding: '20px 24px',
  boxShadow: '0 2px 8px rgba(213,122,102,0.07)',
};

// Display order: Mon → Sun; 0 = Sunday in .NET DayOfWeek
const DAYS = [
  { value: 1, label: 'Пн' },
  { value: 2, label: 'Вт' },
  { value: 3, label: 'Ср' },
  { value: 4, label: 'Чт' },
  { value: 5, label: 'Пт' },
  { value: 6, label: 'Сб' },
  { value: 0, label: 'Нд' },
];

export default function RegularDaysOffSection({ settings, addMutation, removeMutation }) {
  const offSet = new Set((settings?.regularDaysOff ?? []).map((d) => d.dayOfWeek));
  const isPending = addMutation.isPending || removeMutation.isPending;

  const toggle = (dayOfWeek) => {
    if (offSet.has(dayOfWeek)) {
      removeMutation.mutate(dayOfWeek);
    } else {
      addMutation.mutate(dayOfWeek);
    }
  };

  return (
    <div style={CARD}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
        Регулярні вихідні
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
        Оберіть дні, коли салон не працює щотижня
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {DAYS.map(({ value, label }) => {
          const isOff = offSet.has(value);
          return (
            <button
              key={value}
              onClick={() => toggle(value)}
              disabled={isPending}
              title={isOff ? 'Вихідний — натисніть щоб скасувати' : 'Натисніть щоб позначити вихідним'}
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                border: isOff ? 'none' : '1.5px solid #e2e8f0',
                background: isOff ? 'var(--gradient-primary)' : '#f8fafc',
                color: isOff ? '#fff' : '#475569',
                fontSize: 14,
                fontWeight: isOff ? 700 : 400,
                cursor: isPending ? 'not-allowed' : 'pointer',
                boxShadow: isOff ? '0 4px 12px rgba(213,122,102,0.25)' : 'none',
                transition: 'all 0.18s ease',
                opacity: isPending ? 0.7 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                lineHeight: 1,
              }}
            >
              <span>{label}</span>
              {isOff && (
                <span style={{ fontSize: 9, fontWeight: 400, opacity: 0.85 }}>вихід.</span>
              )}
            </button>
          );
        })}
      </div>
      {(addMutation.isError || removeMutation.isError) && (
        <div style={{ marginTop: 10, fontSize: 13, color: '#ef4444' }}>
          Помилка оновлення вихідних
        </div>
      )}
    </div>
  );
}
