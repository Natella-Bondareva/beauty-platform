import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function retentionColor(rate) {
  if (rate >= 60) return '#22c55e';
  if (rate >= 40) return '#f59e0b';
  return '#ef4444';
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #f1f5f9',
        borderRadius: 8,
        padding: '7px 12px',
        fontSize: 13,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <span style={{ color: d.color, fontWeight: 700 }}>{d.label}</span>: {d.value}
    </div>
  );
}

export default function ClientStats({ data, loading }) {
  if (loading) {
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
        <div
          style={{
            height: 160,
            width: 160,
            borderRadius: '50%',
            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
            margin: '0 auto 16px',
          }}
        />
      </div>
    );
  }

  const clients = data?.clients;
  const totalUnique = clients?.totalUnique ?? 0;
  const newClients = clients?.newClients ?? 0;
  const returningClients = clients?.returningClients ?? 0;
  const retentionRate = clients?.retentionRate ?? 0;

  const pieData = [
    { label: 'Нові',     value: newClients,       color: '#3b82f6' },
    { label: 'Повторні', value: returningClients,  color: '#D57A66' },
  ].filter((d) => d.value > 0);

  const color = retentionColor(retentionRate);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Клієнти</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>Нові та повторні</div>
      </div>

      {/* Donut */}
      <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto' }}>
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
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
            {totalUnique}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>унікальних</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6' }}>{newClients}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>🆕 нових</div>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#D57A66' }}>{returningClients}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>🔄 повторних</div>
        </div>
      </div>

      {/* Retention rate */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: 10,
          padding: '12px 16px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
          Коефіцієнт повернення
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color }}>
          {retentionRate.toFixed(1)}%
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
          Хороший показник для салону краси — понад 60%
        </div>
      </div>
    </div>
  );
}
