import React, { useState } from 'react';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import { ToggleSwitch } from '../../../../shared/ui/ToggleSwitch';
import { accent, peach, inputStyle } from '../../../../shared/ui/tokens';
import { useEmployees } from '../../hooks/useEmployees';

const ADMIN_ACCESS_OPTIONS = [
  { id: 'dashboard', label: 'Розклад' },
  { id: 'employees', label: 'Персонал' },
  { id: 'bookingFields', label: 'Поля форми' },
  { id: 'salary', label: 'Зарплата' },
  { id: 'subscription', label: 'Підписка' },
  { id: 'analytics', label: 'Аналітика' },
];

export default function InfoTab({ emp, salonCategories, onClose }) {
  const { updateMutation } = useEmployees();
  const isAdmin = emp.role === 'Admin' || emp.role === 'Administrator' || emp.isAdmin === true;
  const [form, setForm] = useState({
    fullName: emp.fullName,
    phone: emp.phone ?? '',
    email: emp.email ?? '',
    categoryIds: (emp.categories ?? []).map((c) => c.id),
    role: emp.role ?? (emp.isAdmin ? 'Admin' : 'Employee'),
    accessScopes: emp.accessScopes ?? (isAdmin ? ADMIN_ACCESS_OPTIONS.map((o) => o.id) : []),
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
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      };
      if (form.role === 'Admin') {
        payload.role = 'Admin';
        payload.isAdmin = true;
        payload.accessScopes = form.accessScopes;
      } else {
        payload.categoryIds = form.categoryIds;
      }
      await updateMutation.mutateAsync({ id: emp.id, data: payload });
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
            <FieldLabel>Роль</FieldLabel>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Employee', 'Admin'].map((option) => {
                const selected = form.role === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      set('role', option);
                      if (option === 'Admin') {
                        set('accessScopes', ADMIN_ACCESS_OPTIONS.map((o) => o.id));
                      }
                    }}
                    style={{
                      padding: '8px 16px', borderRadius: 14,
                      border: selected ? 'none' : `1px solid ${peach}`,
                      background: selected ? 'var(--gradient-primary)' : '#fff',
                      color: selected ? '#fff' : '#64748b',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    }}
                  >
                    {option === 'Admin' ? 'Адміністратор' : 'Майстер'}
                  </button>
                );
              })}
            </div>
            <p style={{ marginTop: 8, fontSize: 13, color: '#94a3b8' }}>
              Адміністратор має доступ до управління системою, майстер — тільки до свого графіку та послуг.
            </p>
          </div>

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

          {form.role !== 'Admin' && salonCategories.length > 0 && (
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

          {form.role === 'Admin' && (
            <div style={{ border: `1px solid ${peach}`, borderRadius: 14, padding: '16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10 }}>Права доступу</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
                {ADMIN_ACCESS_OPTIONS.map((option) => {
                  const selected = form.accessScopes.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => set('accessScopes', selected ? form.accessScopes.filter((id) => id !== option.id) : [...form.accessScopes, option.id])}
                      style={{
                        padding: '10px 12px', borderRadius: 12,
                        border: `1px solid ${selected ? accent : '#e2e8f0'}`,
                        background: selected ? 'var(--gradient-primary)' : '#fff',
                        color: selected ? '#fff' : '#475569',
                        cursor: 'pointer', fontSize: 13, textAlign: 'left',
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p style={{ marginTop: 10, fontSize: 12, color: '#94a3b8' }}>
                Виберіть, до яких розділів адміністратор матиме доступ.
              </p>
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
