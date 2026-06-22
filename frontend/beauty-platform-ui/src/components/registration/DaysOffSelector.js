import React from 'react';

export default function DaysOffSelector({
  regularDaysOff,
  specialDaysOff,
  newSpecialDate,
  newSpecialReason,
  setNewSpecialDate,
  setNewSpecialReason,
  handleRegularDayOffChange,
  addSpecialDayOff,
  removeSpecialDayOff
}) {
  return (
    <div>
      <h2 className="card-title">Вихідні дні</h2>
      <p className="card-subtitle">Встановіть регулярні та спеціальні вихідні</p>

      <div className="form-group">
        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-color)' }}>Регулярні вихідні (щотижня)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { value: 1, label: 'Понеділок' },
            { value: 2, label: 'Вівторок' },
            { value: 3, label: 'Середа' },
            { value: 4, label: 'Четвер' },
            { value: 5, label: "П'ятниця" },
            { value: 6, label: 'Субота' },
            { value: 0, label: 'Неділя' }
          ].map(day => (
            <label key={day.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={regularDaysOff.includes(day.value)}
                onChange={(e) => handleRegularDayOffChange(day.value, e.target.checked)}
              />
              {day.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-color)' }}>Спеціальні вихідні</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
          <input
            type="date"
            className="form-input"
            value={newSpecialDate}
            onChange={(e) => setNewSpecialDate(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Причина (необов'язково)"
            value={newSpecialReason}
            onChange={(e) => setNewSpecialReason(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" className="btn btn-primary" onClick={addSpecialDayOff}>
            Додати
          </button>
        </div>
        {specialDaysOff.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {specialDaysOff.map((day, index) => (
              <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'var(--secondary-color)', borderRadius: '4px', marginBottom: '4px' }}>
                <span>{new Date(day.date).toLocaleDateString('uk-UA')} {day.reason && `— ${day.reason}`}</span>
                <button type="button" className="btn btn-secondary" onClick={() => removeSpecialDayOff(day.date)}>
                  Видалити
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
