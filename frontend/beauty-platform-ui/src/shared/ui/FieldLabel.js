import React from 'react';

export function FieldLabel({ children, title }) {
  return (
    <label
      title={title}
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: '#64748b',
        display: 'block',
        marginBottom: 3,
        cursor: title ? 'help' : 'default',
      }}
    >
      {children}
    </label>
  );
}
