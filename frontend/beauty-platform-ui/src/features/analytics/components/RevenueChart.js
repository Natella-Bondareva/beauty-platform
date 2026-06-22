import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, differenceInDays } from 'date-fns';
import { SkeletonChart } from './SkeletonLoader';

const accent = '#D57A66';

function formatDateLabel(dateStr, totalDays) {
  try {
    const d = parseISO(dateStr);
    return totalDays <= 31 ? format(d, 'dd.MM') : format(d, 'dd.MM');
  } catch {
    return dateStr;
  }
}

function formatFullDate(dateStr) {
  try {
    const months = [
      'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
      'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
    ];
    const d = parseISO(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #f1f5f9',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
        {formatFullDate(label)}
      </div>
      <div style={{ color: '#64748b' }}>
        Виручка: <span style={{ fontWeight: 700, color: accent }}>{(item?.revenue ?? 0).toLocaleString('uk-UA')} грн</span>
      </div>
      <div style={{ color: '#64748b', marginTop: 2 }}>
        Записів: <span style={{ fontWeight: 700, color: '#1e293b' }}>{item?.completedBookings ?? 0}</span>
      </div>
    </div>
  );
}

function formatYAxis(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}к`;
  return value;
}

export default function RevenueChart({ data, loading }) {
  if (loading) return <SkeletonChart />;

  const chartData = data?.revenueChart ?? [];
  const totalDays =
    chartData.length >= 2
      ? differenceInDays(
          parseISO(chartData[chartData.length - 1].date),
          parseISO(chartData[0].date)
        )
      : 30;

  const hasData = chartData.some((d) => d.revenue > 0);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Виручка за період</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>Динаміка надходжень</div>
      </div>

      {chartData.length === 0 ? (
        <div
          style={{
            height: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: 14,
          }}
        >
          Немає даних за обраний період
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accent} stopOpacity={0.2} />
                <stop offset="95%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => formatDateLabel(d, totalDays)}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={accent}
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                const color = payload.revenue === 0 ? '#cbd5e1' : accent;
                return (
                  <circle
                    key={`dot-${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                );
              }}
              activeDot={{ r: 5, fill: accent, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
