import React, { useState } from 'react';

const accent = '#D57A66';

function ServiceBar({ service, maxBookings }) {
  const [hovered, setHovered] = useState(false);
  const pct = maxBookings > 0 ? (service.bookingsCount / maxBookings) * 100 : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', paddingBottom: 10 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
        <span style={{ color: '#1e293b', fontWeight: 500, flex: 1, marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {service.serviceName}
        </span>
        <span style={{ color: '#94a3b8', flexShrink: 0, fontSize: 12 }}>
          {service.bookingsCount} зап. &nbsp;
          <span style={{ color: '#D57A66', fontWeight: 600 }}>
            {(service.totalRevenue ?? 0).toLocaleString('uk-UA')} грн
          </span>
        </span>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${accent}, #e8967e)`,
            borderRadius: 4,
            transition: 'width 0.6s ease',
          }}
        />
      </div>

      {/* Tooltip */}
      {hovered && service.averagePrice != null && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: -32,
            background: '#1e293b',
            color: '#fff',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 12,
            whiteSpace: 'nowrap',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          Сер. ціна: {(service.averagePrice).toLocaleString('uk-UA')} грн
        </div>
      )}
    </div>
  );
}

export default function TopServices({ data, loading }) {
  if (loading) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: '20px 24px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
          Топ послуги
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: 36,
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s infinite',
              borderRadius: 6,
              marginBottom: 12,
            }}
          />
        ))}
      </div>
    );
  }

  const services = (data?.topServices ?? []).slice(0, 5);
  const maxBookings = services[0]?.bookingsCount || 1;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        flex: 1,
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Топ послуги</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>За кількістю записів</div>
      </div>

      {services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 14 }}>
          Немає даних
        </div>
      ) : (
        services.map((s) => (
          <ServiceBar key={s.serviceId} service={s} maxBookings={maxBookings} />
        ))
      )}
    </div>
  );
}
