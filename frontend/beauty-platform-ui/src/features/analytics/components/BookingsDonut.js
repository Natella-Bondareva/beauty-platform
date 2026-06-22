import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SkeletonDonut } from './SkeletonLoader';

const STATUSES = [
  { key: 'completed', label: 'Завершено',  icon: '✅', color: '#22c55e' },
  { key: 'cancelled', label: 'Скасовано',  icon: '❌', color: '#ef4444' },
  { key: 'noShow',    label: 'Неявки',     icon: '👻', color: '#f97316' },
  { key: 'pending',   label: 'Очікують',   icon: '⏳', color: '#94a3b8' },
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #f1f5f9',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <span style={{ color: d.color, fontWeight: 700 }}>{d.label}</span>:{' '}
      <span style={{ fontWeight: 700 }}>{d.value}</span>
    </div>
  );
}

export default function BookingsDonut({ data, loading }) {
  if (loading) return <SkeletonDonut />;

  const bookings = data?.bookings;
  const total = bookings?.total ?? 0;

  const pieData = STATUSES.map((s) => ({
    ...s,
    value: bookings?.[s.key] ?? 0,
  })).filter((d) => d.value > 0);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Записи</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>Розподіл за статусами</div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Donut chart */}
        <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={pieData.length ? pieData : [{ value: 1, color: '#f1f5f9', label: '' }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
              >
                {(pieData.length ? pieData : [{ color: '#f1f5f9' }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              {pieData.length > 0 && <Tooltip content={<CustomTooltip />} />}
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
              {total}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>всього</div>
          </div>
        </div>

        {/* Status list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 160 }}>
          {STATUSES.map((s) => {
            const count = bookings?.[s.key] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={s.key}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 13, color: '#475569' }}>
                    {s.icon} {s.label}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    {count} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 11 }}>{pct}%</span>
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    background: '#f1f5f9',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: s.color,
                      borderRadius: 4,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
