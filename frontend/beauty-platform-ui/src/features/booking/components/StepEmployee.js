import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../api/booking.api';
import { Avatar } from '../../../shared/ui/Avatar';

const accent = '#D57A66';
const peach = '#FFD1B3';

function EmployeeTile({ name, avatarUrl, categories, price, duration, hasOverride, isAny, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 14,
        border: `1.5px solid ${hovered ? accent : peach}`,
        background: hovered ? '#FFF5F0' : '#fff',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
        boxShadow: hovered ? '0 4px 16px rgba(213,122,102,0.12)' : 'none',
        width: '100%',
      }}
    >
      {isAny ? (
        <div
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}
        >
          ✨
        </div>
      ) : (
        <Avatar name={name} avatarUrl={avatarUrl} size={44} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{name}</div>
        {!isAny && categories?.length > 0 && (
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            {categories.map((c) => c.name).join(', ')}
          </div>
        )}
        {isAny && (
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            Система обере найближчий вільний час
          </div>
        )}
      </div>

      {!isAny && price != null && (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>
            {price} ₴
            {hasOverride?.price && (
              <span
                title="Індивідуальна ціна майстра"
                style={{ marginLeft: 4, fontSize: 10, color: '#94a3b8', fontWeight: 400 }}
              >
                ★
              </span>
            )}
          </div>
          {duration != null && (
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
              {duration} хв
              {hasOverride?.duration && (
                <span
                  title="Індивідуальна тривалість майстра"
                  style={{ marginLeft: 3, fontSize: 10, color: '#94a3b8' }}
                >
                  ★
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

export default function StepEmployee({ salonId, selectedService, onSelect }) {
  const serviceId = selectedService?.id;

  const employeesQuery = useQuery({
    queryKey: ['booking', salonId, 'employees-for-service', serviceId],
    queryFn: () => bookingApi.getEmployeesForService(salonId, serviceId).then((r) => r.data),
    enabled: !!salonId && !!serviceId,
  });

  if (employeesQuery.isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
        Завантаження майстрів…
      </div>
    );
  }

  const employees = employeesQuery.data ?? [];

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
        Оберіть майстра
      </div>
      <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
        Крок 2 з 6 · Послуга: <strong style={{ color: '#64748b' }}>{selectedService?.name}</strong>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <EmployeeTile
          isAny
          name="Будь-який майстер"
          onClick={() => onSelect(null)}
        />
        {employees.map((emp) => (
          <EmployeeTile
            key={emp.id}
            name={emp.fullName}
            avatarUrl={emp.avatarUrl}
            categories={emp.categories}
            price={emp.effectivePrice}
            duration={emp.effectiveClientDuration}
            hasOverride={{ price: emp.hasPriceOverride, duration: emp.hasDurationOverride }}
            onClick={() => onSelect(emp)}
          />
        ))}

        {employees.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 14 }}>
            Немає доступних майстрів для цієї послуги
          </div>
        )}
      </div>

      {employees.some((e) => e.hasPriceOverride || e.hasDurationOverride) && (
        <div style={{ marginTop: 14, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
          ★ — індивідуальна ціна або тривалість майстра
        </div>
      )}
    </div>
  );
}
