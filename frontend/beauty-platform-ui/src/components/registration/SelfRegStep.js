import React from 'react';

export default function SelfRegStep({ yearsExperience, setYearsExperience, workType, selectedCategories }) {
  const previewYear = yearsExperience && parseInt(yearsExperience) > 0
    ? new Date().getFullYear() - parseInt(yearsExperience)
    : null;

  return (
    <div>
      <h2 className="card-title text-center">Ваш профіль майстра</h2>

      {workType === 'me_and_team' && (
        <div style={{
          background: 'var(--gradient-primary)',
          border: '1px solid var(--accent-color)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 20,
          fontSize: 14,
          color: 'var(--text-color)',
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          Спочатку заповнимо інформацію про вас, а потім зможете додати команду.
        </div>
      )}

      {selectedCategories.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary, #888)', marginBottom: 8, textAlign: 'center' }}>
            Ваші спеціалізації:
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {selectedCategories.map(c => (
              <span key={c.id} style={{
                padding: '4px 14px', borderRadius: 20,
                background: 'var(--gradient-primary)',
                border: '1px solid var(--accent-color)',
                fontSize: 13, fontWeight: 500,
                color: 'var(--text-color)'
              }}>{c.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Скільки у вас років досвіду? (необов'язково)</label>
        <input
          type="number"
          className="form-input"
          min={0}
          max={50}
          value={yearsExperience}
          onChange={e => setYearsExperience(e.target.value)}
          placeholder="Наприклад: 3"
        />
        {previewYear && (
          <p style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary, #888)' }}>
            Дата початку: 1 січня {previewYear} р.
          </p>
        )}
      </div>
    </div>
  );
}
