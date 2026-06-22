import { useState } from 'react';

const accent = '#D57A66';
const peach = '#FFD1B3';

function FieldInput({ field, value, onChange, error }) {
  const base = {
    width: '100%',
    padding: '10px 13px',
    borderRadius: 10,
    border: `1.5px solid ${error ? '#fca5a5' : peach}`,
    fontSize: 14,
    color: '#1E293B',
    outline: 'none',
    background: error ? '#fff5f5' : '#fff',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  switch (field.type) {
    case 'Text':
      return (
        <input
          type="text"
          placeholder={field.placeholder || ''}
          value={value?.textValue || ''}
          onChange={(e) => onChange({ textValue: e.target.value })}
          style={base}
        />
      );

    case 'TextArea':
      return (
        <textarea
          rows={3}
          placeholder={field.placeholder || ''}
          value={value?.textValue || ''}
          onChange={(e) => onChange({ textValue: e.target.value })}
          style={{ ...base, resize: 'vertical', fontFamily: 'inherit' }}
        />
      );

    case 'YesNo':
      return (
        <div style={{ display: 'flex', gap: 12 }}>
          {['Так', 'Ні'].map((opt) => (
            <label
              key={opt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 18px',
                borderRadius: 10,
                border: `1.5px solid ${value?.textValue === opt ? accent : peach}`,
                background: value?.textValue === opt ? '#FFF5F0' : '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: value?.textValue === opt ? 600 : 400,
                color: value?.textValue === opt ? accent : '#475569',
                transition: 'all 0.15s',
              }}
            >
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value?.textValue === opt}
                onChange={() => onChange({ textValue: opt })}
                style={{ display: 'none' }}
              />
              {opt}
            </label>
          ))}
        </div>
      );

    case 'Select':
      return (
        <select
          value={value?.textValue || ''}
          onChange={(e) => onChange({ textValue: e.target.value })}
          style={{ ...base, cursor: 'pointer' }}
        >
          <option value="">Оберіть варіант</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );

    case 'FileUpload':
      return (
        <div>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 10,
              border: `1.5px dashed ${error ? '#fca5a5' : peach}`,
              background: '#FFF5F0',
              cursor: 'pointer',
              fontSize: 13,
              color: accent,
              fontWeight: 500,
            }}
          >
            <span>📎</span>
            {value?.fileUrl ? 'Файл обрано' : (field.placeholder || 'Завантажити файл')}
            <input
              type="file"
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onChange({ fileUrl: file.name, _file: file });
              }}
            />
          </label>
          {value?.fileUrl && (
            <span style={{ marginLeft: 10, fontSize: 12, color: '#64748b' }}>{value.fileUrl}</span>
          )}
        </div>
      );

    default:
      return null;
  }
}

export default function StepBookingFields({ bookingFields, fieldAnswers, onAnswer, onNext, totalSteps }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    bookingFields.forEach((f) => {
      if (!f.isRequired) return;
      const val = fieldAnswers[f.id];
      const empty =
        !val ||
        (f.type === 'FileUpload' ? !val.fileUrl : !val.textValue?.trim());
      if (empty) next[f.id] = "Обов'язкове поле";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
        Додаткова інформація
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
        Крок 5 з {totalSteps} · Дайте відповідь на кілька питань
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {bookingFields.map((field) => (
          <div key={field.id}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#1E293B',
              marginBottom: 6,
            }}>
              {field.label}
              {field.isRequired && (
                <span style={{ color: accent, marginLeft: 3 }}>*</span>
              )}
            </label>

            <FieldInput
              field={field}
              value={fieldAnswers[field.id]}
              onChange={(val) => onAnswer(field.id, val)}
              error={!!errors[field.id]}
            />

            {errors[field.id] && (
              <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>
                {errors[field.id]}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        style={{
          marginTop: 28,
          width: '100%',
          padding: '13px',
          borderRadius: 12,
          border: 'none',
          background: 'var(--gradient-primary)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(213,122,102,0.3)',
        }}
      >
        Далі
      </button>
    </div>
  );
}
