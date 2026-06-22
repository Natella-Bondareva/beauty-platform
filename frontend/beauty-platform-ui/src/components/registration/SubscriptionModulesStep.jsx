import React from 'react';

const MONTH_OPTIONS = [
  { value: 1, label: '1 місяць' },
  { value: 3, label: '3 місяці' },
  { value: 6, label: '6 місяців' },
  { value: 12, label: '12 місяців' },
];

export default function SubscriptionModulesStep({
  config,
  configLoading,
  selectedModules,
  toggleModule,
  months,
  setMonths,
  totalPrice,
}) {
  if (configLoading) {
    return (
      <div className="text-center" style={{ padding: 'var(--spacing-xl) 0' }}>
        <p className="text-secondary">Завантаження планів...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="card-title">Ваш план</h2>
      <p className="card-subtitle" style={{ marginBottom: 'var(--spacing-lg)' }}>
        Оберіть модулі, які вам потрібні. Ціна залежить від кількості майстрів та підключених функцій.
      </p>

      {/* Price per master info */}
      {config && config.pricePerMaster > 0 && (
        <div style={{
          background: 'var(--gradient-primary)',
          border: '1px solid var(--secondary-color)',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 'var(--spacing-md)',
          fontSize: 13,
          color: 'var(--text-secondary)',
        }}>
          Кожен додатковий майстер&nbsp;—&nbsp;
          <strong style={{ color: 'var(--text-primary)' }}>
            {config.pricePerMaster} грн / міс
          </strong>
          . Вартість буде розрахована після додавання майстрів.
        </div>
      )}

      {/* Free modules */}
      {config && config.freeModules.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Включено безкоштовно
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {config.freeModules.map(mod => (
              <div key={mod.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid var(--secondary-color)',
                background: 'var(--gradient-primary)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--accent-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#fff', flexShrink: 0,
                  }}>✓</span>
                  <span style={{ fontSize: 14 }}>{mod.name}</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--accent-color)', fontWeight: 600 }}>Безкоштовно</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid modules */}
      {config && config.paidModules.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Додаткові модулі
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {config.paidModules.map(mod => {
              const active = selectedModules.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1px solid ${active ? 'var(--accent-color)' : 'var(--secondary-color)'}`,
                    background: active ? 'var(--gradient-primary)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: 4,
                      border: `2px solid ${active ? 'var(--accent-color)' : 'var(--secondary-color)'}`,
                      background: active ? 'var(--accent-color)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#fff', flexShrink: 0,
                      transition: 'all 0.2s',
                    }}>
                      {active ? '✓' : ''}
                    </span>
                    <span style={{ fontSize: 14 }}>{mod.name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {mod.price} грн / міс
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Months selector */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <label className="form-label">Термін підписки</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {MONTH_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMonths(opt.value)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 8,
                border: `1px solid ${months === opt.value ? 'var(--accent-color)' : 'var(--secondary-color)'}`,
                background: months === opt.value ? 'var(--gradient-primary)' : 'transparent',
                color: months === opt.value ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: months === opt.value ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price preview */}
      {totalPrice > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '12px',
          borderRadius: 8,
          border: '1px solid var(--accent-color)',
          background: 'var(--gradient-primary)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>Орієнтовна вартість</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-color)' }}>
            {totalPrice} грн
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>за {months} {months === 1 ? 'місяць' : 'місяці'}</p>
        </div>
      )}

      {!config && !configLoading && (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 14 }}>
          Конфігурацію буде завантажено після створення салону.
        </p>
      )}
    </div>
  );
}
