import React from 'react';
import teamImg from '../assets/team.jpg';
import soloImg from '../assets/solo.jpg';

export default function TeamChoiceCard({ value, label, description, selected, onClick, img }) {
  return (
    <div
      className={`card fade-in ${selected ? 'bg-gradient-primary' : ''}`}
      style={{
        cursor: 'pointer',
        border: selected ? '2px solid var(--accent-color)' : '2px solid transparent',
        boxShadow: selected ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transition: 'all 0.2s',
        maxWidth: 320,
        margin: '0 12px',
        textAlign: 'center',
        padding: 24
      }}
      onClick={() => onClick(value)}
    >
      <img src={img} alt={label} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', marginBottom: 16 }} />
      <h3 style={{ color: 'var(--text-color)', fontWeight: 600, fontSize: 20 }}>{label}</h3>
      <p className="text-secondary" style={{ fontSize: 15 }}>{description}</p>
    </div>
  );
}
