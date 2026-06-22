import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../api/booking.api';

const accent = '#D57A66';
const peach = '#FFD1B3';

function CategoryTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 20,
        border: `1.5px solid ${active ? accent : '#e2e8f0'}`,
        background: active ? accent : '#fff',
        color: active ? '#fff' : '#64748b',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function ServiceCard({ service, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onClick(service)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '16px',
        borderRadius: 14,
        border: `1.5px solid ${hovered ? accent : peach}`,
        background: hovered ? '#FFF5F0' : '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
        boxShadow: hovered ? '0 4px 16px rgba(213,122,102,0.12)' : 'none',
      }}
    >
      {service.coverImageUrl && (
        <img
          src={service.coverImageUrl}
          alt={service.name}
          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }}
        />
      )}
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{service.name}</div>
      {service.description && (
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{service.description}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {service.minClientDuration != null && service.minClientDuration !== service.maxClientDuration
            ? `${service.minClientDuration}–${service.maxClientDuration} хв`
            : `${service.clientDurationMinutes} хв`}
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: accent }}>
          {service.minPrice != null && service.minPrice !== service.maxPrice
            ? `від ${service.minPrice} ₴`
            : `${service.price} ₴`}
        </span>
      </div>
    </button>
  );
}

export default function StepServices({ salonId, onSelect }) {
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const servicesQuery = useQuery({
    queryKey: ['booking', salonId, 'services'],
    queryFn: () => bookingApi.getServices(salonId).then((r) => r.data),
    enabled: !!salonId,
  });

  const categoriesQuery = useQuery({
    queryKey: ['booking', salonId, 'categories'],
    queryFn: () => bookingApi.getActiveCategories(salonId).then((r) => r.data),
    enabled: !!salonId,
  });

  const services = servicesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const filtered = activeCategoryId
    ? services.filter((s) => s.categoryId === activeCategoryId)
    : services;

  if (servicesQuery.isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
        Завантаження послуг…
      </div>
    );
  }

  if (servicesQuery.isError) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#ef4444', fontSize: 14 }}>
        Не вдалося завантажити послуги
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
        Оберіть послугу
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
        Крок 1 з 6
      </div>

      {categories.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <CategoryTab
            label="Всі"
            active={activeCategoryId === null}
            onClick={() => setActiveCategoryId(null)}
          />
          {categories.map((cat) => (
            <CategoryTab
              key={cat.id}
              label={cat.name}
              active={activeCategoryId === cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 14 }}>
          Послуги не знайдено
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {filtered.map((svc) => (
            <ServiceCard key={svc.id} service={svc} onClick={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
