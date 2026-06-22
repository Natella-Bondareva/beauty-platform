import React from 'react';
import { SkeletonListItem } from './SkeletonLoader';

function workloadColor(pct) {
  if (pct > 85) return '#ef4444';
  if (pct > 60) return '#f59e0b';
  return '#22c55e';
}

function Initials({ name }) {
  const parts = (name || '').trim().split(/\s+/);
  const text = parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : (parts[0] || '?')[0];

  const colors = ['#D57A66', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#14b8a6'];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bg = colors[hash % colors.length];

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 700,
        flexShrink: 0,
        textTransform: 'uppercase',
      }}
    >
      {text.toUpperCase()}
    </div>
  );
}

function EmployeeRow({ employee, maxRevenue }) {
  const {
    fullName,
    avatarUrl,
    revenue = 0,
    completedBookings = 0,
    workloadPercent = 0,
    averageCheck = 0,
  } = employee;

  const hasNoWork = completedBookings === 0;
  const barColor = workloadColor(workloadPercent);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 0',
        borderBottom: '1px solid #f8fafc',
        opacity: hasNoWork ? 0.55 : 1,
      }}
    >
      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName}
          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <Initials name={fullName} />
      )}

      {/* Name + specialization */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fullName}
          {hasNoWork && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 11,
                padding: '1px 7px',
                borderRadius: 20,
                background: '#f1f5f9',
                color: '#94a3b8',
                fontWeight: 500,
              }}
            >
              не працював
            </span>
          )}
        </div>
        {/* Workload bar */}
        <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              flex: 1,
              height: 5,
              background: '#f1f5f9',
              borderRadius: 4,
              overflow: 'hidden',
              maxWidth: 120,
            }}
          >
            <div
              style={{
                width: `${Math.min(workloadPercent, 100)}%`,
                height: '100%',
                background: barColor,
                borderRadius: 4,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: barColor, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {workloadPercent.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Revenue */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
          {revenue.toLocaleString('uk-UA')} грн
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
          {completedBookings} зап.
        </div>
      </div>
    </div>
  );
}

export default function EmployeeRanking({ data, loading }) {
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
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
          Рейтинг майстрів
        </div>
        {[1, 2, 3].map((i) => <SkeletonListItem key={i} />)}
      </div>
    );
  }

  const employees = [...(data?.employees ?? [])].sort((a, b) => b.revenue - a.revenue);
  const maxRevenue = employees[0]?.revenue || 1;

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
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Рейтинг майстрів</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>За виручкою за обраний період</div>
      </div>

      {employees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 14 }}>
          Немає даних за обраний період
        </div>
      ) : (
        employees.map((emp) => (
          <EmployeeRow key={emp.employeeId} employee={emp} maxRevenue={maxRevenue} />
        ))
      )}
    </div>
  );
}
