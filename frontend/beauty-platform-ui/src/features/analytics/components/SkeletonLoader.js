import React from 'react';

const shimmerStyle = {
  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: 8,
};

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('skeleton-keyframes')) {
  const style = document.createElement('style');
  style.id = 'skeleton-keyframes';
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}

function Rect({ width = '100%', height = 16, style = {} }) {
  return <div style={{ ...shimmerStyle, width, height, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <Rect width={80} height={12} />
      <Rect width={120} height={28} />
      <Rect width={100} height={12} />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        border: '1px solid #f1f5f9',
      }}
    >
      <Rect width={140} height={16} style={{ marginBottom: 20 }} />
      <Rect width="100%" height={240} />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid #f8fafc',
      }}
    >
      <Rect width={40} height={40} style={{ borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Rect width={140} height={14} />
        <Rect width={100} height={10} />
        <Rect width="60%" height={8} style={{ borderRadius: 4 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <Rect width={70} height={14} />
        <Rect width={50} height={10} />
      </div>
    </div>
  );
}

export function SkeletonDonut() {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 24,
        border: '1px solid #f1f5f9',
        display: 'flex',
        gap: 24,
        alignItems: 'center',
      }}
    >
      <Rect width={160} height={160} style={{ borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Rect width="80%" height={12} />
            <Rect width="100%" height={6} style={{ borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorBlock({ message, onRetry }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 32,
        border: '1px solid #fee2e2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        color: '#ef4444',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 28 }}>⚠️</span>
      <span style={{ fontSize: 14, color: '#64748b' }}>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            color: '#475569',
          }}
        >
          Спробувати знову
        </button>
      )}
    </div>
  );
}
