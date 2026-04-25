import React from 'react';
import { accent } from './tokens';

export function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={!disabled ? onChange : undefined}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        flexShrink: 0,
        background: disabled ? '#e2e8f0' : checked ? accent : '#cbd5e1',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.22s',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: checked ? 22 : 4,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
          transition: 'left 0.22s',
        }}
      />
    </div>
  );
}
