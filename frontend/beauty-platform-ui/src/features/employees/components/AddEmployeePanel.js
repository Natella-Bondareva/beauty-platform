import React, { useState } from 'react';
import { FieldLabel } from '../../../shared/ui/FieldLabel';
import { accent, peach, inputStyle } from '../../../shared/ui/tokens';
import { useEmployees } from '../hooks/useEmployees';

const ADMIN_ACCESS_OPTIONS = [
  { id: 'dashboard', label: 'Розклад' },
  { id: 'employees', label: 'Персонал' },
  { id: 'bookingFields', label: 'Поля форми' },
  { id: 'salary', label: 'Зарплата' },
  { id: 'subscription', label: 'Підписка' },
  { id: 'analytics', label: 'Аналітика' },
];

export default function AddEmployeePanel({ categories, onClose, defaultRole = 'Employee' }) {
  const { createMutation } = useEmployees();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    yearsExperience: '',
    categoryIds: [],
    role: defaultRole,
    createAccount: defaultRole === 'Admin',
    accountEmail: '',
    accountPassword: '',
    accessScopes: defaultRole === 'Admin' ? ADMIN_ACCESS_OPTIONS.map((o) => o.id) : [],
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

  const toggleScope = (scopeId) => {
    set('accessScopes',
      form.accessScopes.includes(scopeId)
        ? form.accessScopes.filter((id) => id !== scopeId)
        : [...form.accessScopes, scopeId]
    );
  };

  const handleRoleChange = (role) => {
    if (role === 'Admin') {
      setForm((prev) => ({
        ...prev,
        role: 'Admin',
        createAccount: true,
        accessScopes: ADMIN_ACCESS_OPTIONS.map((o) => o.id),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      role: 'Employee',
      accessScopes: [],
    }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) { setError("Ім'я є обов'язковим"); return; }
    if (form.role === 'Admin' && (!form.accountEmail.trim() || !form.accountPassword.trim())) {
      setError('Адміністратор потребує email та пароль для входу');
      return;
    }
    if (form.createAccount && form.role !== 'Admin' && (!form.accountEmail.trim() || !form.accountPassword.trim())) {
      setError('Для облікового запису вкажіть email та пароль');
      return;
    }

    try {
      const yrs = parseInt(form.yearsExperience);
      const hireDate =
        yrs > 0 ? new Date(new Date().getFullYear() - yrs, 0, 1).toISOString() : null;
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        categoryIds: form.categoryIds,
        hireDate,
        avatarUrl: null,
      };
      if (form.role === 'Admin') {
        payload.role = 'Admin';
        payload.isAdmin = true;
        payload.accessScopes = form.accessScopes;
      }
      if (form.createAccount) {
        payload.userAccount = {
          email: form.accountEmail.trim(),
          password: form.accountPassword,
          role: form.role === 'Admin' ? 'Admin' : 'Employee',
        };
      }

      await createMutation.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Помилка додавання');
    }
  };

  return (
    <>
      <div style={{ padding: '20px 24px 18px', borderBottom: `1px solid ${peach}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              {form.role === 'Admin' ? 'Новий адміністратор' : 'Новий майстер'}
            </div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1E293B' }}>
              {form.role === 'Admin' ? 'Додати адміністратора' : 'Додати майстра'}
            </h3>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, border: `1px solid ${peach}`, borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 16, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
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
                    onClick={() => handleRoleChange(option)}
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
              Адміністратори мають доступ до управління системою та можуть мати індивідуальні права.
            </p>
          </div>

          <div>
            <FieldLabel>Повне ім'я *</FieldLabel>
            <input style={inputStyle} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Олена Коваль" />
          </div>
          <div>
            <FieldLabel>Телефон</FieldLabel>
            <input style={inputStyle} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+380XXXXXXXXX" />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <input style={inputStyle} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="необов'язково" />
          </div>
          <div>
            <FieldLabel title="Використовується для розрахунку дати початку роботи (1 січня відповідного року)">
              Досвід роботи (роки) ⓘ
            </FieldLabel>
            <input style={inputStyle} type="number" min={0} max={50} value={form.yearsExperience} onChange={(e) => set('yearsExperience', e.target.value)} placeholder="0" />
          </div>

          {categories.length > 0 && form.role !== 'Admin' && (
            <div>
              <FieldLabel>Спеціалізації</FieldLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                {categories.map((cat) => {
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

          <div style={{ border: `1px solid ${peach}`, borderRadius: 14, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Обліковий запис</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  {form.role === 'Admin'
                    ? 'Адміністратору потрібно створити обліковий запис для входу.'
                    : 'Створити доступ до системи для цього співробітника.'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleRoleChange(form.role === 'Admin' ? 'Employee' : 'Admin')}
                  style={{
                    padding: '8px 14px', borderRadius: 10, border: `1px solid ${peach}`,
                    background: '#fff', color: '#475569', cursor: 'pointer', fontSize: 12,
                  }}
                >
                  {form.role === 'Admin' ? 'Змінити роль' : 'Створити обліковий запис'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <FieldLabel>Email для входу {form.role === 'Admin' ? '*' : ''}</FieldLabel>
                <input
                  style={inputStyle}
                  type="email"
                  value={form.accountEmail}
                  onChange={(e) => set('accountEmail', e.target.value)}
                  placeholder="admin@salon.com"
                />
              </div>
              <div>
                <FieldLabel>Пароль {form.role === 'Admin' ? '*' : ''}</FieldLabel>
                <input
                  style={inputStyle}
                  type="password"
                  value={form.accountPassword}
                  onChange={(e) => set('accountPassword', e.target.value)}
                  placeholder="Мінімум 8 символів"
                />
              </div>
            </div>
          </div>

          {form.role === 'Admin' && (
            <div>
              <FieldLabel>Права доступу адміністратора</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginTop: 10 }}>
                {ADMIN_ACCESS_OPTIONS.map((option) => {
                  const checked = form.accessScopes.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleScope(option.id)}
                      style={{
                        padding: '10px 12px', borderRadius: 12,
                        border: `1px solid ${checked ? accent : '#e2e8f0'}`,
                        background: checked ? 'var(--gradient-primary)' : '#fff',
                        color: checked ? '#fff' : '#475569',
                        cursor: 'pointer', fontSize: 13, textAlign: 'left',
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 24px', borderTop: `1px solid ${peach}`, display: 'flex', gap: 10, flexShrink: 0 }}>
        <button onClick={handleSave} disabled={createMutation.isPending} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--gradient-primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: createMutation.isPending ? 0.7 : 1 }}>
          {createMutation.isPending ? 'Додавання...' : form.role === 'Admin' ? 'Додати адміністратора' : 'Додати майстра'}
        </button>
        <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: `1px solid ${peach}`, background: '#fff', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>Скасувати</button>
      </div>
    </>
  );
}
