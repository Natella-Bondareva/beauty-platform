import React from 'react';
import { FieldLabel } from '../../../shared/ui/FieldLabel';
import { accent, peach, inputStyle } from '../../../shared/ui/tokens';

const fmt = (m) => `${m} хв`;

export default function ServiceRow({
  svc,
  isEditing,
  form,
  onChangeForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  loading,
}) {
  if (isEditing) {
    return (
      <div
        style={{
          background: '#FFF5F0',
          borderRadius: 10,
          padding: 14,
          marginBottom: 8,
          border: `1px solid ${peach}`,
        }}
      >
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: 10 }}
        >
          <div style={{ gridColumn: '1/-1' }}>
            <FieldLabel>Назва *</FieldLabel>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => onChangeForm('name', e.target.value)}
            />
          </div>
          <div>
            <FieldLabel title="Час що блокується у розкладі майстра">Сист. час (хв) * ⓘ</FieldLabel>
            <input
              style={inputStyle}
              type="number"
              min={15}
              value={form.systemDurationMinutes}
              onChange={(e) => onChangeForm('systemDurationMinutes', e.target.value)}
            />
          </div>
          <div>
            <FieldLabel title="Час що бачить клієнт при бронюванні">Клієнт. час (хв) * ⓘ</FieldLabel>
            <input
              style={inputStyle}
              type="number"
              min={15}
              value={form.clientDurationMinutes}
              onChange={(e) => onChangeForm('clientDurationMinutes', e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Ціна (грн) *</FieldLabel>
            <input
              style={inputStyle}
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => onChangeForm('price', e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Опис</FieldLabel>
            <input
              style={inputStyle}
              value={form.description}
              onChange={(e) => onChangeForm('description', e.target.value)}
              placeholder="необов'язково"
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onSaveEdit}
            disabled={loading}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              background: accent,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {loading ? '...' : 'Зберегти'}
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${peach}`,
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Скасувати
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 14px',
        background: '#fff',
        border: `1px solid ${peach}`,
        borderRadius: 10,
        marginBottom: 6,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1E293B' }}>{svc.name}</div>
        <div
          style={{
            fontSize: 12,
            color: '#94a3b8',
            marginTop: 3,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span title="Системний час">⏱ {fmt(svc.systemDurationMinutes)}</span>
          <span title="Клієнтський час">👤 {fmt(svc.clientDurationMinutes)}</span>
          <span style={{ color: accent, fontWeight: 600 }}>{svc.price} грн</span>
        </div>
        {svc.description && (
          <div
            style={{
              fontSize: 11,
              color: '#94a3b8',
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {svc.description}
          </div>
        )}
      </div>
      <button
        onClick={() => onStartEdit(svc)}
        title="Редагувати"
        style={{
          width: 30,
          height: 30,
          border: `1px solid ${peach}`,
          borderRadius: 7,
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 13,
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.12s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF5F0'; e.currentTarget.style.color = accent; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
      >
        ✎
      </button>
      <button
        onClick={() => onDelete(svc.id)}
        title="Видалити"
        style={{
          width: 30,
          height: 30,
          border: '1px solid #fca5a5',
          borderRadius: 7,
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 12,
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 0.12s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        ✕
      </button>
    </div>
  );
}
