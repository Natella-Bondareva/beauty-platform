import React from 'react';
import Icon from '../../components/dashboard/Icon';

export function EmptyState({ icon, text, sub, action, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '44px 24px', color: '#94a3b8' }}>
      <Icon name={icon} size={48} color="#FFD1B3" />
      <p style={{ marginTop: 14, fontSize: 15, fontWeight: 600, color: '#64748b' }}>{text}</p>
      {sub && <p style={{ margin: '6px 0 0', fontSize: 13 }}>{sub}</p>}
      {action && (
        <button
          onClick={onAction}
          style={{
            marginTop: 20,
            padding: '9px 22px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--gradient-primary)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 2px 10px rgba(213,122,102,0.3)',
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}
