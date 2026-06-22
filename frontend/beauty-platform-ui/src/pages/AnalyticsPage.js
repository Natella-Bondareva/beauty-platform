import React, { useState } from 'react';
import DashboardLayout from '../widgets/DashboardLayout';
import { useAuthStore } from '../features/auth/store/authStore';
import { useAnalytics, defaultDateRange } from '../features/analytics/hooks/useAnalytics';
import DateRangePicker from '../features/analytics/components/DateRangePicker';
import FinanceCards from '../features/analytics/components/FinanceCards';
import RevenueChart from '../features/analytics/components/RevenueChart';
import BookingsDonut from '../features/analytics/components/BookingsDonut';
import EmployeeRanking from '../features/analytics/components/EmployeeRanking';
import TopServices from '../features/analytics/components/TopServices';
import ClientStats from '../features/analytics/components/ClientStats';

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        gap: 16,
        color: '#94a3b8',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 56 }}>📭</span>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#475569' }}>
        За цей період записів не знайдено
      </div>
      <div style={{ fontSize: 14 }}>
        Спробуйте обрати інший діапазон дат
      </div>
    </div>
  );
}


export default function AnalyticsPage() {
  const salonId = useAuthStore((s) => s.salonId);
  const [dateRange, setDateRange] = useState(defaultDateRange);

  const { data, loading, error, reload } = useAnalytics(salonId, dateRange);

  const isEmpty =
    !loading &&
    !error &&
    data &&
    (data.bookings?.total ?? 0) === 0 &&
    (data.finance?.revenue ?? 0) === 0;

  return (
    <DashboardLayout
      title="Аналітика"
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* Sticky filter header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: '#F8FAFC',
          borderBottom: '1px solid #FFD1B3',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
        }}
      >
        <DateRangePicker value={dateRange} onApply={setDateRange} />
      </div>

      {/* Main content */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            color: '#ef4444',
            fontSize: 14,
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={reload}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              border: '1px solid #fecaca',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              color: '#ef4444',
              fontWeight: 600,
            }}
          >
            Спробувати знову
          </button>
        </div>
      )}

      {/* Finance cards */}
      <FinanceCards data={data} loading={loading} />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          {/* Revenue chart */}
          <RevenueChart data={data} loading={loading} />

          {/* Bookings + employee ranking */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px', minWidth: 280 }}>
              <BookingsDonut data={data} loading={loading} />
            </div>
            <div style={{ flex: '2 1 400px', minWidth: 300 }}>
              <EmployeeRanking data={data} loading={loading} />
            </div>
          </div>

          {/* Top services + client stats */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: '3 1 360px', minWidth: 280 }}>
              <TopServices data={data} loading={loading} />
            </div>
            <div style={{ flex: '2 1 280px', minWidth: 260 }}>
              <ClientStats data={data} loading={loading} />
            </div>
          </div>
        </>
      )}
      </div>
    </DashboardLayout>
  );
}
