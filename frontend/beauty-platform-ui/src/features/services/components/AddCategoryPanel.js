import React, { useState } from 'react';
import { FieldLabel } from '../../../shared/ui/FieldLabel';
import { accent, peach, inputStyle } from '../../../shared/ui/tokens';
import { useSalonCategories } from '../hooks/useSalonServices';

export default function AddCategoryPanel({ templates, onClose }) {
  const { createMutation } = useSalonCategories();
  const [form, setForm] = useState({ templateId: '', name: '', description: '', iconUrl: '' });
  const [error, setError] = useState('');

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const selectedTemplate = templates.find((t) => t.id === form.templateId);

  const handleSave = async () => {
    if (!form.templateId) { setError('Оберіть шаблон категорії'); return; }
    try {
      await createMutation.mutateAsync({
        name: form.name.trim() || selectedTemplate?.name,
        description: form.description.trim() || selectedTemplate?.description || null,
        iconUrl: form.iconUrl.trim() || selectedTemplate?.iconUrl || null,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Помилка додавання категорії');
    }
  };

  return (
    <>
      <div style={{ padding: '20px 24px 18px', borderBottom: `1px solid ${peach}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Додати категорію</div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1E293B' }}>Новий шаблон категорії</h3>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, border: `1px solid ${peach}`, borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 14, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>{error}</p>}

        <div style={{ marginBottom: 18 }}>
          <FieldLabel>Оберіть базовий шаблон</FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
            {templates.map((t) => {
              const selected = t.id === form.templateId;
              return (
                <button key={t.id} type="button" onClick={() => set('templateId', t.id)} style={{
                  padding: 16, borderRadius: 16, textAlign: 'left', cursor: 'pointer', minHeight: 120,
                  border: selected ? `2px solid ${accent}` : '1px solid #e2e8f0',
                  background: selected ? 'rgba(213,122,102,0.08)' : '#fff',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1E293B' }}>{t.name}</div>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', minHeight: 40 }}>{t.description}</div>
                  </div>
                  {selected && <div style={{ marginTop: 10, fontSize: 12, color: accent }}>Обрано</div>}
                </button>
              );
            })}
          </div>
        </div>

        {selectedTemplate?.defaultServices?.length > 0 && (
          <div style={{ marginBottom: 20, padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 10, fontSize: 13, fontWeight: 700, color: '#475569' }}>Стандартні послуги шаблону</div>
            {selectedTemplate.defaultServices.map((s) => (
              <div key={s.id} style={{ padding: 10, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{s.name}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 12, color: '#64748b' }}>
                  <span>Сист. {s.systemDurationMinutes} хв</span>
                  <span>Кл. {s.clientDurationMinutes} хв</span>
                  <span>{s.suggestedPrice} грн</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gap: '12px 14px', gridTemplateColumns: '1fr 1fr', marginBottom: 18 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <FieldLabel>Назва (залиш порожнім щоб використати з шаблону)</FieldLabel>
            <input style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={selectedTemplate?.name ?? ''} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <FieldLabel>Опис</FieldLabel>
            <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder={selectedTemplate?.description ?? ''} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <FieldLabel>URL іконки</FieldLabel>
            <input style={inputStyle} value={form.iconUrl} onChange={(e) => set('iconUrl', e.target.value)} placeholder={selectedTemplate?.iconUrl ?? 'https://...'} />
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 24px', borderTop: `1px solid ${peach}`, display: 'flex', gap: 10, flexShrink: 0 }}>
        <button onClick={handleSave} disabled={createMutation.isPending} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--gradient-primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: createMutation.isPending ? 0.7 : 1 }}>
          {createMutation.isPending ? 'Зберігаю...' : 'Створити категорію'}
        </button>
        <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: `1px solid ${peach}`, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>Скасувати</button>
      </div>
    </>
  );
}
