import React from 'react';

const CAT_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f5576c,#f093fb)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fd7043,#ff8a65)',
  'linear-gradient(135deg,#26a69a,#80cbc4)',
];

export default function CategoryCard({ cat, idx, count, onEdit }) {
  const bg = cat.iconUrl
    ? `linear-gradient(rgba(0,0,0,0.30),rgba(0,0,0,0.55)),url(${cat.iconUrl}) center/cover`
    : CAT_GRADIENTS[idx % CAT_GRADIENTS.length];

  return (
    <div
      onClick={onEdit}
      style={{
        position: 'relative',
        width: 200,
        height: 148,
        borderRadius: 18,
        overflow: 'hidden',
        flexShrink: 0,
        background: bg,
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
        transition: 'transform 0.17s,box-shadow 0.17s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.13)';
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        title="Редагувати послуги"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 30,
          height: 30,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,0.38)',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 14,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.42)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
      >
        ✎
      </button>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '28px 14px 14px',
          background: 'linear-gradient(transparent,rgba(0,0,0,0.52))',
        }}
      >
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
          {cat.name}
        </div>
        {cat.description && (
          <div
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 11,
              marginTop: 3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.description}
          </div>
        )}
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 5 }}>
          {count} {count === 1 ? 'послуга' : count < 5 ? 'послуги' : 'послуг'}
        </div>
      </div>
    </div>
  );
}
