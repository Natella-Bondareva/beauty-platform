import React, { useState } from 'react';
import { inputStyle } from '../../../shared/ui/tokens';

const accent = '#D57A66';
const peach = '#FFD1B3';

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#64748b',
  marginBottom: 4,
};

function Field({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: accent, marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

export default function StepContact({ selectedService, selectedSlot, contact, onChange, onNext }) {
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!contact.phone.trim()) {
      setError('Введіть номер телефону');
      return;
    }
    if (!/^\+?[\d\s\-()]{7,15}$/.test(contact.phone.trim())) {
      setError('Введіть коректний номер телефону');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
        Ваші контакти
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
        Крок 4 з 6
      </div>

      <div
        style={{
          background: '#FFF5F0',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 24,
          border: `1px solid ${peach}`,
          fontSize: 13,
          color: '#64748b',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: '#1E293B' }}>{selectedService?.name}</strong>
        {selectedSlot && (
          <>
            {' · '}{selectedSlot.startTimeLocal}
            {selectedSlot.employeeName && (
              <> · {selectedSlot.employeeName}</>
            )}
          </>
        )}
      </div>

      <Field
        label="Ім'я"
        value={contact.firstName}
        onChange={(v) => onChange({ ...contact, firstName: v })}
        placeholder="Необов'язково"
      />
      <Field
        label="Телефон"
        value={contact.phone}
        onChange={(v) => onChange({ ...contact, phone: v })}
        type="tel"
        placeholder="+380501234567"
        required
      />

      {error && (
        <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 12 }}>{error}</div>
      )}

      <button
        onClick={handleNext}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 12,
          border: 'none',
          background: 'var(--gradient-primary)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(213,122,102,0.3)',
          transition: 'opacity 0.15s',
        }}
      >
        Перейти до підтвердження
      </button>
    </div>
  );
}
