import React from 'react';

export default function SubscriptionSummaryStep({ config, selectedModules, extraMasters, months }) {
  if (!config) return null;

  const masterCost = extraMasters * config.pricePerMaster * months;
  const modulesCost = selectedModules.reduce((sum, id) => {
    const mod = config.paidModules.find(m => m.id === id);
    return sum + (mod?.price ?? 0) * months;
  }, 0);
  const totalPrice = masterCost + modulesCost;

  const selectedPaidModules = selectedModules
    .map(id => config.paidModules.find(m => m.id === id))
    .filter(Boolean);

  const monthLabel = months === 1 ? '1 місяць' : `${months} місяці`;

  return (
    <div>
      <h2 className="card-title">Ваш план</h2>
      <p className="card-subtitle" style={{ marginBottom: 'var(--spacing-lg)' }}>
        Перегляньте деталі перед тим, як продовжити. Оплату можна здійснити пізніше в налаштуваннях.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--spacing-lg)' }}>

        {/* Free modules */}
        {config.freeModules.map(mod => (
          <div key={mod.id} style={rowStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={checkStyle}>✓</span>
              <span style={{ fontSize: 14 }}>{mod.name}</span>
            </div>
            <span style={{ fontSize: 13, color: 'var(--accent-color)', fontWeight: 600 }}>Безкоштовно</span>
          </div>
        ))}

        {/* Extra masters */}
        {extraMasters > 0 && (
          <div style={rowStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={checkStyle}>✓</span>
              <span style={{ fontSize: 14 }}>
                Майстри ({extraMasters} × {config.pricePerMaster} грн × {months} міс)
              </span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{masterCost} грн</span>
          </div>
        )}

        {/* Selected paid modules */}
        {selectedPaidModules.map(mod => (
          <div key={mod.id} style={rowStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={checkStyle}>✓</span>
              <span style={{ fontSize: 14 }}>{mod.name} × {months} міс</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{mod.price * months} грн</span>
          </div>
        ))}

        {/* No paid items */}
        {extraMasters === 0 && selectedPaidModules.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
            Тільки безкоштовні модулі
          </p>
        )}
      </div>

      {/* Total */}
      <div style={{
        borderTop: '1px solid var(--secondary-color)',
        paddingTop: 'var(--spacing-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Разом за {monthLabel}</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: totalPrice > 0 ? 'var(--accent-color)' : 'inherit' }}>
            {totalPrice > 0 ? `${totalPrice} грн` : 'Безкоштовно'}
          </p>
        </div>
        {totalPrice > 0 && (
          <div style={{
            background: 'var(--gradient-primary)',
            border: '1px solid var(--secondary-color)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}>
            <div>~{Math.round(totalPrice / months)} грн</div>
            <div>на місяць</div>
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)', textAlign: 'center' }}>
        Натисніть «Пропустити», щоб продовжити без оплати. Підписку можна активувати пізніше.
      </p>
    </div>
  );
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid var(--secondary-color)',
  background: 'var(--gradient-primary)',
};

const checkStyle = {
  width: 18,
  height: 18,
  borderRadius: '50%',
  background: 'var(--accent-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 11,
  color: '#fff',
  flexShrink: 0,
};
