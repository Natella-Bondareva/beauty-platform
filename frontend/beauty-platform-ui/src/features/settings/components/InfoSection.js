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

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
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

export default function InfoSection({ salon, mutation }) {
  const [form, setForm] = useState({ name: '', phone: '', street: '', city: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (salon) {
      setForm({
        name: salon.name ?? '',
        phone: salon.phone ?? '',
        street: salon.address?.street ?? '',
        city: salon.address?.city ?? '',
      });
    }
  }, [salon]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    mutation.mutate(form, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    });
  };

  return (
    <div style={CARD}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>
        Основна інформація
      </div>
      <Field label="Назва салону" value={form.name} onChange={set('name')} placeholder="Beauty Studio" />
      <Field
        label="Телефон"
        value={form.phone}
        onChange={set('phone')}
        type="tel"
        placeholder="+380501234567"
      />
      <Field
        label="Вулиця"
        value={form.street}
        onChange={set('street')}
        placeholder="вул. Хрещатик 1"
      />
      <Field label="Місто" value={form.city} onChange={set('city')} placeholder="Київ" />
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 4 }}
      >
        {mutation.isError && (
          <span style={{ fontSize: 13, color: '#ef4444' }}>
            {mutation.error?.response?.data?.message ?? 'Помилка збереження'}
          </span>
        )}
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
