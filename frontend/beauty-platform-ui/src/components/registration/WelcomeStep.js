import React from 'react';

export default function WelcomeStep() {
  return (
    <div className="text-center">
      <h2 className="card-title">Welcome to Beauty Platform!</h2>
      <p className="card-subtitle">Your account and salon have been created successfully. Let's get you started.</p>
      <div style={{ margin: 'var(--spacing-xl) 0' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--gradient-primary)',
          borderRadius: 'var(--border-radius-full)',
          margin: '0 auto var(--spacing-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem'
        }}>
          ✓
        </div>
        <p>You're all set! Start managing your beauty business with our CRM system.</p>
      </div>
    </div>
  );
}