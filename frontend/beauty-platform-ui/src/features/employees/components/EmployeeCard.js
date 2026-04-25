import React from 'react';
import { Avatar } from '../../../shared/ui/Avatar';
import { accent, peach } from '../../../shared/ui/tokens';

export default function EmployeeCard({ emp, onEdit }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 18,
        border: `1px solid ${peach}`,
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        position: 'relative',
        transition: 'box-shadow 0.15s,transform 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(213,122,102,0.14)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: emp.isActive ? '#22c55e' : '#94a3b8',
          boxShadow: emp.isActive ? '0 0 0 2.5px rgba(34,197,94,0.2)' : 'none',
        }}
        title={emp.isActive ? 'Активний' : 'Неактивний'}
      />
      <Avatar name={emp.fullName} avatarUrl={emp.avatarUrl} size={60} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>{emp.fullName}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{emp.phone}</div>
      </div>
      {emp.categories?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {emp.categories.map((c) => (
            <span
              key={c.id}
              style={{
                padding: '2px 8px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 500,
                background: '#FFF5F0',
                color: accent,
                border: `1px solid ${peach}`,
              }}
            >
              {c.name}
            </span>
          ))}
        </div>
      )}
      <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 10 }}>
        <span>{emp.servicesCount ?? 0} послуг</span>
        {emp.hasUserAccount && (
          <span title="Має обліковий запис" style={{ color: '#a78bfa' }}>
            🔑 акаунт
          </span>
        )}
      </div>
      <button
        onClick={onEdit}
        style={{
          width: '100%',
          padding: '7px',
          borderRadius: 8,
          marginTop: 4,
          border: `1px solid ${peach}`,
          background: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          color: '#64748b',
          fontWeight: 500,
          transition: 'all 0.14s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#FFF5F0';
          e.currentTarget.style.color = accent;
          e.currentTarget.style.borderColor = accent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#fff';
          e.currentTarget.style.color = '#64748b';
          e.currentTarget.style.borderColor = peach;
        }}
      >
        Редагувати
      </button>
    </div>
  );
}
