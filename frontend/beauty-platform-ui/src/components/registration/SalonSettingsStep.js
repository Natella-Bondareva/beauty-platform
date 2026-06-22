import React from 'react';

export default function SalonSettingsStep({ settings, handleSettingsChange, adjustTime, adjustDuration }) {
  return (
    <div>
      <h2 className="card-title">Налаштування салону</h2>
      <p className="card-subtitle">Налаштуйте робочий час та параметри салону</p>
      <div className="form-group">
        <label className="form-label" htmlFor="openingTime">Час відкриття</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => adjustTime('openingTime', -30)}>-</button>
          <input
            type="time"
            id="openingTime"
            name="openingTime"
            className="form-input"
            value={settings.openingTime}
            onChange={handleSettingsChange}
            required
            style={{ flex: 1 }}
          />
          <button type="button" className="btn btn-secondary" onClick={() => adjustTime('openingTime', 30)}>+</button>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="closingTime">Час закриття</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => adjustTime('closingTime', -30)}>-</button>
          <input
            type="time"
            id="closingTime"
            name="closingTime"
            className="form-input"
            value={settings.closingTime}
            onChange={handleSettingsChange}
            required
            style={{ flex: 1 }}
          />
          <button type="button" className="btn btn-secondary" onClick={() => adjustTime('closingTime', 30)}>+</button>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="defaultSlotDurationMinutes">Тривалість слоту (хвилини)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => adjustDuration(-15)}>-</button>
          <input
            type="number"
            id="defaultSlotDurationMinutes"
            name="defaultSlotDurationMinutes"
            className="form-input"
            value={settings.defaultSlotDurationMinutes}
            onChange={handleSettingsChange}
            min="15"
            max="120"
            required
            style={{ flex: 1 }}
          />
          <button type="button" className="btn btn-secondary" onClick={() => adjustDuration(15)}>+</button>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="timezone">Часовий пояс</label>
        <input
          type="text"
          id="timezone"
          name="timezone"
          className="form-input"
          value={settings.timezone}
          onChange={handleSettingsChange}
          required
          placeholder="Europe/Kyiv"
        />
      </div>
    </div>
  );
}
