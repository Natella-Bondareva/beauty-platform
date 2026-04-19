import React from 'react';

export default function CategoryStep({ categories, selectedCategories, setSelectedCategories }) {
  const toggle = (category) => {
    setSelectedCategories(prev =>
      prev.some(c => c.id === category.id)
        ? prev.filter(c => c.id !== category.id)
        : [...prev, category]
    );
  };

  return (
    <div>
      <h2 className="card-title text-center">Оберіть вашу спеціалізацію</h2>
      <p className="card-subtitle text-center mb-lg">Можна обрати декілька категорій</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
        gap: 12,
        maxHeight: 320,
        overflowY: 'auto',
        padding: '2px 4px'
      }}>
        {categories.map((category) => {
          const isSelected = selectedCategories.some(c => c.id === category.id);
          return (
            <div
              key={category.id}
              onClick={() => toggle(category)}
              style={{
                cursor: 'pointer',
                border: `2px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color, #e0e0e0)'}`,
                borderRadius: 12,
                background: isSelected ? 'var(--gradient-primary)' : 'var(--card-bg, #fff)',
                boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                transition: 'all 0.18s ease',
                padding: '16px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                height: 120,
                position: 'relative',
                userSelect: 'none'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 6, right: 8,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--accent-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 700
                }}>✓</div>
              )}
              {category.iconUrl ? (
                <img
                  src={category.iconUrl}
                  alt={category.name}
                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--secondary-color, #f0f0f0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                }}>✂️</div>
              )}
              <span style={{
                fontWeight: 600, fontSize: 13,
                color: 'var(--text-color)',
                textAlign: 'center',
                lineHeight: 1.3,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {category.name}
              </span>
            </div>
          );
        })}
      </div>

      {selectedCategories.length > 0 && (
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--accent-color)', fontWeight: 500, textAlign: 'center' }}>
          Обрано: {selectedCategories.map(c => c.name).join(', ')}
        </p>
      )}
    </div>
  );
}
