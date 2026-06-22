import React, { useState, useEffect } from 'react';
import { SkeletonCard } from './SkeletonLoader';

function useAnimatedValue(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target == null) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

function GrowthIndicator({ percent }) {
  if (percent == null) return null;
  const isPositive = percent > 0;
  const isNegative = percent < 0;
  const color = isPositive ? '#22c55e' : isNegative ? '#ef4444' : '#94a3b8';
  const arrow = isPositive ? '↑' : isNegative ? '↓' : '→';
  return (
    <span style={{ color, fontWeight: 700, fontSize: 13 }}>
      {arrow} {Math.abs(percent).toFixed(1)}%
    </span>
  );
}

function FinanceCard({ icon, title, value, valueStr, sub, subRight, accent = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '18px 20px',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flex: '1 1 160px',
        minWidth: 140,
        transition: 'transform 0.18s, box-shadow 0.18s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 8px 24px rgba(213,122,102,0.13)'
          : '0 1px 4px rgba(0,0,0,0.04)',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: accent ? '#D57A66' : '#1e293b',
          letterSpacing: '-0.5px',
          lineHeight: 1.1,
        }}
      >
        {valueStr || value}
      </div>
      {(sub || subRight) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {sub && <span style={{ fontSize: 12, color: '#94a3b8' }}>{sub}</span>}
          {subRight}
        </div>
      )}
    </div>
  );
}

function formatMoney(n) {
  if (n == null) return '—';
  return n.toLocaleString('uk-UA') + ' грн';
}

export default function FinanceCards({ data, loading }) {
  const revenue = useAnimatedValue(data?.finance?.revenue ?? null);
  const avgCheck = useAnimatedValue(data?.finance?.averageCheck ?? null);
  const expected = useAnimatedValue(data?.finance?.expectedRevenue ?? null);
  const bookings = useAnimatedValue(data?.bookings?.completed ?? null);

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const growth = data?.finance?.revenueGrowthPercent ?? null;
  const prevRevenue = data?.finance?.previousPeriodRevenue;

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      <FinanceCard
        icon="💰"
        title="Виручка"
        value={revenue}
        valueStr={formatMoney(revenue)}
        sub={prevRevenue != null ? `vs ${prevRevenue.toLocaleString('uk-UA')} грн` : undefined}
      />
      <FinanceCard
        icon="📈"
        title="Динаміка"
        valueStr={growth != null ? `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%` : '—'}
        value={growth}
        sub="vs минулого"
        subRight={<GrowthIndicator percent={growth} />}
      />
      <FinanceCard
        icon="🧾"
        title="Середній чек"
        value={avgCheck}
        valueStr={formatMoney(avgCheck)}
      />
      <FinanceCard
        icon="⏳"
        title="Очікується"
        value={expected}
        valueStr={formatMoney(expected)}
        sub="підтверджені"
      />
      <FinanceCard
        icon="📊"
        title="Записів"
        value={bookings}
        valueStr={bookings != null ? String(bookings) : '—'}
        sub="завершено"
      />
    </div>
  );
}
