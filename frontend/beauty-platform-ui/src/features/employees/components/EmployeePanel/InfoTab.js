import React, { useState } from 'react';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import { accent, peach, inputStyle } from '../../../../shared/ui/tokens';
import { useEmployees } from '../../hooks/useEmployees';

export default function InfoTab({ emp, salonCategories, onClose }) {
  const { updateMutation } = useEmployees();
  const [form, setForm] = useState({
    fullName: emp.fullName,
    phone: emp.phone ?? '',
    email: emp.email ?? '',
    categoryIds: (emp.categories ?? []).map((c) => c.id),
  });
  const [error, setError] = useState('');

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const toggleCat = (id) => {
    set(
      'categoryIds',
      form.categoryIds.includes(id)
        ? form.categoryIds.filter((c) => c !== id)
        : [...form.categoryIds, id]
    );
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) { setError("Ім'я є обов'язковим"); return; }
    try {
      await updateMutation.mutateAsync({
        id: emp.id,
        data: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          categoryIds: form.categoryIds,
        },
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Помилка збереження');
    }
  };

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 14, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>{error}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <FieldLabel>Повне ім'я *</FieldLabel>
            <input style={inputStyle} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Телефон</FieldLabel>
            <input style={inputStyle} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+380XXXXXXXXX" />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <input style={inputStyle} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="необов'язково" />
          </div>
          {salonCategories.length > 0 && (
            <div>
              <FieldLabel>Спеціалізації</FieldLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                {salonCategories.map((cat) => {
                  const selected = form.categoryIds.includes(cat.id);
                  return (
                    <button key={cat.id} type="button" onClick={() => toggleCat(cat.id)} style={{
                      padding: '6px 14px', borderRadius: 20,
                      border: `1.5px solid ${selected ? accent : peach}`,
                      background: selected ? 'var(--gradient-primary)' : '#fff',
                      color: selected ? '#fff' : '#64748b',
                      cursor: 'pointer', fontSize: 13, fontWeight: selected ? 600 : 400,
                      transition: 'all 0.15s',
                    }}>{cat.name}</button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 24px', borderTop: `1px solid ${peach}`, display: 'flex', gap: 10, flexShrink: 0 }}>
        <button onClick={handleSave} disabled={updateMutation.isPending} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--gradient-primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: updateMutation.isPending ? 0.7 : 1 }}>
          {updateMutation.isPending ? 'Збереження...' : 'Зберегти'}
        </button>
        <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: `1px solid ${peach}`, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>Скасувати</button>
      </div>
    </>
  );
}
