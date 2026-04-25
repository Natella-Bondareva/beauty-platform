import React from 'react';
import { accent } from './tokens';

export function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 18px',
        border: 'none',
        cursor: 'pointer',
        background: 'transparent',
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        color: active ? accent : '#64748b',
        borderBottom: active ? `2px solid ${accent}` : '2px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}
