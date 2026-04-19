import React from 'react';

export default function TeamMemberFormStep({
  selectedCategories,
  form,
  onFormChange,
  yearsExperience,
  setYearsExperience,
  createAccount,
  setCreateAccount,
  accountEmail,
  setAccountEmail,
  accountPassword,
  setAccountPassword,
}) {
  const previewYear = yearsExperience && parseInt(yearsExperience) > 0
    ? new Date().getFullYear() - parseInt(yearsExperience)
    : null;

  return (
    <div>
      <h2 className="card-title text-center">Дані майстра</h2>

      {selectedCategories.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          {selectedCategories.map(c => (
            <span key={c.id} style={{
              padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: 'var(--gradient-primary)', border: '1px solid var(--accent-color)'
            }}>{c.name}</span>
          ))}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Повне ім'я *</label>
        <input
          className="form-input"
          name="fullName"
          value={form.fullName}
          onChange={onFormChange}
          placeholder="Марія Петренко"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Телефон *</label>
        <input
          className="form-input"
          name="phone"
          value={form.phone}
          onChange={onFormChange}
          placeholder="+380671234567"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email (необов'язково)</label>
        <input
          className="form-input"
          name="email"
          value={form.email}
          onChange={onFormChange}
          placeholder="maria@salon.com"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Років досвіду (необов'язково)</label>
        <input
          type="number"
          className="form-input"
          min={0}
          max={50}
          value={yearsExperience}
          onChange={e => setYearsExperience(e.target.value)}
          placeholder="Наприклад: 2"
        />
        {previewYear && (
          <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary, #888)' }}>
            Дата початку: 1 січня {previewYear} р.
          </p>
        )}
      </div>

      {/* User account toggle */}
      <div style={{
        border: '1px solid var(--border-color, #e0e0e0)',
        borderRadius: 10,
        padding: '14px 16px',
        marginTop: 4
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
          <div
            onClick={() => setCreateAccount(v => !v)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: createAccount ? 'var(--accent-color)' : 'var(--secondary-color, #ccc)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0, cursor: 'pointer'
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3,
              left: createAccount ? 23 : 3,
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </div>
          <span style={{ fontWeight: 500, fontSize: 14 }}>Створити обліковий запис для майстра</span>
        </label>
        <p style={{ fontSize: 12, color: 'var(--text-secondary, #888)', marginTop: 6, marginLeft: 54 }}>
          Майстер зможе входити у систему та керувати своїм розкладом
        </p>

        {createAccount && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-color, #e0e0e0)' }}>
            <div className="form-group">
              <label className="form-label">Email для входу *</label>
              <input
                className="form-input"
                type="email"
                value={accountEmail}
                onChange={e => setAccountEmail(e.target.value)}
                placeholder="maria@salon.com"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Пароль *</label>
              <input
                className="form-input"
                type="password"
                value={accountPassword}
                onChange={e => setAccountPassword(e.target.value)}
                placeholder="Мінімум 8 символів"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
